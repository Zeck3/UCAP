import re
import json
import camelot
import fitz  # PyMuPDF


# -----------------------------------------------------------
# 1) Extract CO → PO Mapping from Table (Camelot)
# -----------------------------------------------------------
def extract_po_mapping(filepath):
    try:
        tables = camelot.read_pdf(filepath, pages="all", flavor="lattice")
    except:
        tables = camelot.read_pdf(filepath, pages="all", flavor="stream")

    results = []

    for table in tables:
        df = table.df

        header_row_index = None
        po_columns = {}  # {col_index: "a"}

        for i, row in df.iterrows():
            clean_cells = [c.strip().lower() for c in row]

            # We look for a row that contains many **single letters**
            candidates = [
                (col_i, c) for col_i, c in enumerate(clean_cells)
                if len(c) == 1 and c.isalpha()
            ]

            if len(candidates) >= 5:  # Expect at least a,b,c,d,e...
                header_row_index = i
                po_columns = {col_i: c for col_i, c in candidates}
                break

        if not po_columns:
            continue  # no mapping table here

        for i in range(header_row_index + 1, len(df)):
            row = df.iloc[i]
            row_text = " ".join(row)

            co_match = re.search(r"\bCO\s*\d+\b", row_text, re.I)
            if not co_match:
                continue

            co = co_match.group(0).replace(" ", "").upper()
            desc = row[0].strip()
            mapped_pos = []

            # Check only PO columns
            for col_i, po_letter in po_columns.items():
                cell_val = row[col_i].strip().upper()
                if cell_val in ("I", "D", "E"):
                    mapped_pos.append(f"PO-{po_letter}")

            # ✅ Skip fake/empty duplicated CO lines
            if not mapped_pos:
                continue

            results.append({
                "CO": co,
                "Description": desc,
                "Mapped_POs": sorted(set(mapped_pos))
            })

    return results


# -----------------------------------------------------------
# 2) Extract CO Full Descriptions from Course Outcomes Section (PyMuPDF)
# -----------------------------------------------------------
def extract_co_descriptions(filepath):
    doc = fitz.open(filepath)
    co_text_parts = []
    capture = False

    for page in doc:
        text = page.get_text("text")

        # --- Normalize and remove repeating headers/footers ---
        text = re.sub(r"Document Code No\..*?Page No\..*", "", text, flags=re.I)
        text = re.sub(r"Rev\..*?Page", "", text, flags=re.I)
        text = re.sub(r"\s+", " ", text)

        # --- Detect if Course Outcomes section begins ---
        if re.search(r"Course Outcomes?|Intended Learning Outcomes", text, re.I):
            capture = True

        if capture:
            co_text_parts.append(text)

        # --- Stop only at Course Outline (not before) ---
        if re.search(r"\bIII\.\s*Course Outline\b", text, re.I):
            break

    if not co_text_parts:
        return {}

    # Combine captured pages
    section_text = " ".join(co_text_parts)

    # =====================================================
    # 🧹 CLEAN NOISE BETWEEN PAGES
    # =====================================================

    # Remove page codes, headers, and misc codes
    section_text = re.sub(r"Document Code No\..*?(Page No\.\s*\d+\s*of\s*\d+)?", "", section_text, flags=re.I)
    section_text = re.sub(r"Rev\..*?Effective Date.*?\d{1,2}\s*of\s*\d+", "", section_text, flags=re.I)
    section_text = re.sub(r"\bFM[\-–_ ]?USTP[\-–_ ]?ACAD[\-–_ ]?\d+\b", "", section_text, flags=re.I)

    # Remove known section headings but preserve following text
    section_text = re.sub(r"\bUSTP\s*Core\s*Values\s*:", "\n---CORE_VALUES---", section_text, flags=re.I)
    section_text = re.sub(r"\bProgram\s*Educational\s*Objectives\s*:", "\n---PEO_SECTION---", section_text, flags=re.I)
    section_text = re.sub(r"\bPEO\d\s*:", "\n---PEO_SECTION---", section_text, flags=re.I)

    # Remove redundant I/D/E clusters
    section_text = re.sub(r"\b(I|D|E)\b(?:\s+\b(I|D|E)\b)+", "", section_text, flags=re.I)

    # Normalize whitespace
    section_text = re.sub(r"\s+", " ", section_text).strip()

    # =====================================================
    # 🧩 MATCH CO BLOCKS (stop at USTP Core Values / PEO / Course Outline)
    # =====================================================
    co_descriptions = {}
    pattern = re.compile(
        r"(CO\s*\d+)\s*[:\-]\s*(.*?)(?=\bCO\s*\d+[:\-]|\-\-\-CORE_VALUES\-\-\-|\-\-\-PEO_SECTION\-\-\-|\bIII\.|\bIV\.|$)",
        re.I | re.S
    )

    for match in pattern.finditer(section_text):
        co = match.group(1).replace(" ", "").upper()
        desc = match.group(2).strip()
        co_descriptions[co] = desc

    return co_descriptions


# -----------------------------------------------------------
# 3) Merge mapping + descriptions
# -----------------------------------------------------------
def merge_co_data(mapping_list, desc_map):
    merged = []

    for entry in mapping_list:
        co = entry["CO"]
        if co in desc_map:
            entry["Description"] = desc_map[co]
        else:
            # If description still empty from table, leave placeholder
            entry["Description"] = entry["Description"].strip()

        merged.append(entry)

    # Sort by CO number
    return sorted(merged, key=lambda x: int(re.search(r"\d+", x["CO"]).group()))


# -----------------------------------------------------------
# 4) Main Driver Function
# -----------------------------------------------------------
def extract_co_po(filepath):
    mapping = extract_po_mapping(filepath)
    descriptions = extract_co_descriptions(filepath)
    return merge_co_data(mapping, descriptions)


# -----------------------------------------------------------
# 5) Run & Save
# -----------------------------------------------------------
def main(filepath, output="co_po_mapping.json"):
    print(f"📘 Processing: {filepath}")
    result = extract_co_po(filepath)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"✅ Done! Saved → {output}")


# Example usage
if __name__ == "__main__":
    main("IT215-AccountingPrinciples-syllabus-APPROVED.pdf")