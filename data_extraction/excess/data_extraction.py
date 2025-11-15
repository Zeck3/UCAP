import re
import json
import camelot
import pdfplumber

# -------------------------------------------------------------------
# 1) CLEAN DESCRIPTION — Stop on boundaries, remove core-values bleed
# -------------------------------------------------------------------
STOP_BOUNDARY = re.compile(
    r"(CO\s*\d+[:\-])|(USTP Core Values)|(Program Educational Objectives)|"
    r"(PEO\s*\d)|(Document Code No\.)|(Rev\.)|(Page No\.)",
    re.I
)

def clean_description(desc):
    # Stop at structural boundaries
    desc = STOP_BOUNDARY.split(desc)[0]

    # Remove trailing I/D/E mark noise
    desc = re.sub(r"(?:\b[IDE]\b[\s,]*){2,}", " ", desc, flags=re.I)

    # Normalize whitespace
    return re.sub(r"\s+", " ", desc).strip(" .-")

# -------------------------------------------------------------------
# 2) Extract CO Descriptions from PDF Text
# -------------------------------------------------------------------
def extract_co_descriptions(filepath):
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            txt = page.extract_text() or ""
            text += "\n" + txt

    pattern = re.compile(
        r"(CO\s*\d+)\s*[:\-]\s*(.*?)(?=(CO\s*\d+[:\-])|III\.|IV\.|$)",
        re.I | re.S
    )

    co_desc = {}
    for co, desc, _ in pattern.findall(text):
        co = co.replace(" ", "").upper()
        co_desc[co] = clean_description(desc)

    return co_desc

# -------------------------------------------------------------------
# 3) Extract PO Mapping Across ALL Tables, Globally
# -------------------------------------------------------------------
def extract_po_mapping(filepath):
    try:
        tables = camelot.read_pdf(filepath, pages="all", flavor="lattice")
    except:
        tables = camelot.read_pdf(filepath, pages="all", flavor="stream")

    PO_LETTER = re.compile(r'^[a-z]$', re.I)
    MARK = {"I", "D", "E"}
    CO_RE = re.compile(r'\bCO\s*\d+\b', re.I)

    co_rows = []     # (global_index, CO)
    mark_rows = []   # (global_index, set of PO letters)
    global_idx = 0   # Increasing index across tables

    for table in tables:
        df = table.df

        # Detect PO header row
        header = None
        for row in df.itertuples(index=False):
            row_list = [str(c).strip().lower() for c in row]
            if sum(1 for c in row_list if PO_LETTER.match(c)) >= 3:
                header = {i: row[i].strip().lower() 
                          for i in range(len(row)) 
                          if PO_LETTER.match(row[i].strip().lower())}
                break

        if not header:
            global_idx += len(df)
            continue

        # Collect CO rows
        for i, row in df.iterrows():
            row_text = " ".join(row).strip()
            m = CO_RE.search(row_text)
            if m:
                co = m.group(0).replace(" ", "").upper()
                co_rows.append((global_idx + i, co))

        # Collect mark rows
        for i, row in df.iterrows():
            marks_here = {header[col] for col in header if row[col].strip().upper() in MARK}
            if len(marks_here) >= 2:
                mark_rows.append((global_idx + i, marks_here))

        global_idx += len(df)

    # Match nearest mark row BELOW each CO row
    mapping = {co: [] for _, co in co_rows}
    for co_index, co in co_rows:
        nearest = None
        dist = 99999
        for mark_index, pos_set in mark_rows:
            d = mark_index - co_index
            if 0 < d < dist:
                dist = d
                nearest = pos_set
        if nearest:
            mapping[co] = sorted(f"PO-{p}" for p in nearest)

    return mapping

# -------------------------------------------------------------------
# 4) Merge and Return Final Results
# -------------------------------------------------------------------
def extract_co_po(filepath):
    desc = extract_co_descriptions(filepath)
    mapping = extract_po_mapping(filepath)

    results = []
    for co in sorted(desc.keys(), key=lambda x: int(re.search(r'\d+', x).group())):
        results.append({
            "CO": co,
            "Description": desc[co],
            "Mapped_POs": mapping.get(co, [])
        })
    return results

# -------------------------------------------------------------------
# 5) Runner
# -------------------------------------------------------------------
def main(filepath, output="co_po_mapping.json"):
    data = extract_co_po(filepath)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("✅ Done →", output)

if __name__ == "__main__":
    main("IT-TECHNO 2025 Syllabus-APPROVED.pdf")