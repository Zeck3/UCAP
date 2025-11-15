import re
import json
from typing import Dict, List, Tuple, Optional, Set

import camelot
import pdfplumber

# --------------------------
# Cleaning helpers
# --------------------------
STOP_BOUNDARY = re.compile(
    r"(?:^|\s)(CO\s*\d+\s*[:\-])|(?:^|\s)(USTP Core Values)|"
    r"(?:^|\s)(Program Educational Objectives)|(?:^|\s)(PEO\s*\d)|"
    r"(?:^|\s)(Document Code No\.)|(?:^|\s)(Rev\.)|(?:^|\s)(Page No\.)|"
    r"(?:^|\s)III\.\s*Course Outline",  # hard stop at next section
    re.I
)

CO_RE = re.compile(r"\bCO\s*\d+\b", re.I)
PO_LETTER_RE = re.compile(r"^[a-o]$", re.I)
MARK_SET = {"I", "D", "E"}

def clean_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()

def clean_description(desc: str) -> str:
    cut = STOP_BOUNDARY.split(desc)[0]
    cut = re.sub(r"(?:\b[IDE]\b[\s,;:/-]*){2,}", " ", cut, flags=re.I)
    cut = re.sub(r"[·•●►]+", " ", cut)  # bullet artifacts
    return clean_spaces(cut).strip(" .-")

# --------------------------
# Hybrid Camelot extraction
# --------------------------
def _read_tables(filepath: str):
    """Try lattice first, fall back or merge with stream if lattice incomplete."""
    tables = []
    try:
        tables = camelot.read_pdf(filepath, pages="all", flavor="lattice")
        # if too few columns, likely truncated
        if not tables or all(t.df.shape[1] < 10 for t in tables):
            raise ValueError("Incomplete lattice result")
    except Exception:
        tables = camelot.read_pdf(filepath, pages="all", flavor="stream")
    return tables

# --------------------------
# 1) Extract table-driven data
# --------------------------
def _find_po_header(df) -> Dict[int, str]:
    """Finds {col_idx: 'a'..'o'} row that has single-letter headers."""
    for r_idx in range(len(df)):
        row = [str(df.iat[r_idx, c]).strip().lower() for c in range(df.shape[1])]
        letters = [(c, val) for c, val in enumerate(row) if PO_LETTER_RE.match(val)]
        if len(letters) >= 5:
            return {c: v for c, v in letters}
    return {}

def _extract_from_tables(filepath: str) -> Tuple[Dict[str, str], Dict[str, List[str]]]:
    tables = _read_tables(filepath)

    desc = {}
    mapping = {}
    last_header = {}

    for table in tables:
        df = table.df
        header = _find_po_header(df)

        if not header and last_header:
            header = last_header.copy()
        elif header:
            last_header = header.copy()
        else:
            continue

        header = {c: po for c, po in header.items() if c < df.shape[1]}
        if not header:
            continue

        co_rows = [r for r in range(len(df)) if CO_RE.search(" ".join(df.iloc[r].astype(str)))]

        for i, r in enumerate(co_rows):
            r_next = co_rows[i+1] if i+1 < len(co_rows) else len(df)
            co_id = None
            parts = []

            for c in range(df.shape[1]):
                cell = str(df.iat[r, c])
                m = CO_RE.search(cell)
                if m:
                    co_id = m.group(0).replace(" ", "").upper()
                    tail = cell[m.end():]
                    tail = re.sub(r"^[:\-–]\s*", "", tail)
                    if tail.strip():
                        parts.append(tail.strip())
                    break

            for rr in range(r+1, r_next):
                frag = str(df.iat[rr, 0]).strip()
                if frag:
                    parts.append(frag)

            if co_id:
                desc[co_id] = clean_description(" ".join(parts))
                pos_set = set()
                for rr in range(r, r_next):
                    for col, po in header.items():
                        val = str(df.iat[rr, col]).strip().upper()
                        if any(m in val for m in MARK_SET):
                            pos_set.add(po)
                mapping.setdefault(co_id, set()).update(pos_set)

    mapping_lists = {co: sorted(f"PO-{p}" for p in pos) for co, pos in mapping.items()}
    return desc, mapping_lists

# --------------------------
# 2) Fallback text extraction (bounded CO section)
# --------------------------
def _bounded_text_descriptions(filepath: str) -> Dict[str, str]:
    with pdfplumber.open(filepath) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    start = re.search(r"Program Outcomes\s*\(PO\)", text, flags=re.I)
    end = re.search(r"\nIII\.\s*Course Outline", text, flags=re.I)
    scoped = text[start.end():end.start()] if (start and end and start.start() < end.start()) else text

    pat = re.compile(
        r"(CO\s*\d+)\s*[:\-]\s*(.*?)(?=\bCO\s*\d+\s*[:\-]|USTP Core Values|Program Educational Objectives|III\.)",
        re.I | re.S
    )

    out = {}
    for m in pat.finditer(scoped):
        co = m.group(1).replace(" ", "").upper()
        out[co] = clean_description(m.group(2))
    return out

# --------------------------
# 3) Fill missing descriptions using regex directly from full text
# --------------------------
def _fill_missing_descriptions(filepath: str, existing: Dict[str, str]) -> Dict[str, str]:
    with pdfplumber.open(filepath) as pdf:
        fulltext = "\n".join(p.extract_text() or "" for p in pdf.pages)

    pattern = re.compile(
        r"(CO\d+)\s*[:\-]\s*(.*?)(?=\bCO\d+\s*[:\-]|USTP Core Values|Program Educational Objectives|III\.)",
        re.S | re.I
    )
    for m in pattern.finditer(fulltext):
        co = m.group(1).replace(" ", "").upper()
        desc = clean_description(m.group(2))
        if not existing.get(co):
            existing[co] = desc
    return existing

# --------------------------
# 4) Public API
# --------------------------
def extract_co_po(filepath: str) -> List[Dict[str, object]]:
    table_desc, table_map = _extract_from_tables(filepath)

    if not table_desc:
        text_desc = _bounded_text_descriptions(filepath)
    else:
        text_desc = {}

    # fill gaps
    table_desc = _fill_missing_descriptions(filepath, table_desc)

    all_co_ids = set(table_desc.keys()) | set(table_map.keys()) | set(text_desc.keys())
    def co_key(s: str) -> int:
        m = re.search(r"\d+", s)
        return int(m.group()) if m else 999

    results = []
    for co in sorted(all_co_ids, key=co_key):
        desc = table_desc.get(co) or text_desc.get(co) or ""
        mapped = table_map.get(co, [])
        results.append({"CO": co, "Description": desc, "Mapped_POs": mapped})
    return results

# --------------------------
# 5) CLI
# --------------------------
def main(filepath: str, output="co_po_mapping.json"):
    data = extract_co_po(filepath)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("✅ Done →", output)

if __name__ == "__main__":
    main("IT214-OOP-syllabus-APPROVED.pdf")