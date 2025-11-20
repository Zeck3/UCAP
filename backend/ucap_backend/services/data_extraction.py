from django.db import transaction
from ucap_backend.models import CourseOutcome, OutcomeMapping, ProgramOutcome
import re
import json
import camelot
import fitz

def extract_po_mapping(filepath):
    try:
        tables = camelot.read_pdf(filepath, pages="all", flavor="lattice")
    except Exception:
        tables = camelot.read_pdf(filepath, pages="all", flavor="stream")

    results = []
    canonical_po_letters = None
    seen_cos = set()
    last_po_levels = None

    for table in tables:
        df = table.df

        header_row_index = None
        po_columns = {}

        for i, row in df.iterrows():
            cells = [str(c).strip() for c in row]

            candidates = [
                (idx, cell.lower())
                for idx, cell in enumerate(cells)
                if len(cell) == 1 and cell.isalpha()
            ]
            if not candidates:
                continue

            letters_set = {c for _, c in candidates}
            if len(candidates) >= 3 and not letters_set.issubset({"i", "d", "e"}):
                header_row_index = i

                header_letters = [c.upper() for _, c in candidates]

                if canonical_po_letters is None:
                    canonical_po_letters = header_letters

                po_columns = {idx: c.upper() for idx, c in candidates}
                break

        for i, row in df.iterrows():
            if header_row_index is not None and i <= header_row_index:
                continue

            row_cells = [str(c).strip() for c in row]
            row_text = " ".join(row_cells)

            co_match = re.search(r"\bCO\s*\d+\b", row_text, re.I)
            if not co_match:
                continue

            co = co_match.group(0).replace(" ", "").upper()

            if co in seen_cos:
                continue

            desc_part = row_text[co_match.end():]
            desc_part = re.sub(r"^[\s:\-–]+", "", desc_part)

            desc_part = re.sub(
                r"\b(I|D|E)\b(?:\s+\b(I|D|E)\b)+\s*$", "", desc_part, flags=re.I
            )

            desc_part = re.sub(
                r"\bUSTP[\-–_ ]?ACAD[\-–_ ]?\d+\b", "", desc_part, flags=re.I
            )

            desc = desc_part.strip()

            po_levels: dict[str, str] = {}

            if po_columns:
                for idx, po_letter in po_columns.items():
                    if idx >= len(row_cells):
                        continue
                    val = row_cells[idx].strip().upper()
                    if len(val) == 1 and val in {"I", "D", "E"}:
                        po_key = f"PO-{po_letter.lower()}"
                        po_levels[po_key] = val

            if not po_levels and canonical_po_letters:
                tokens = re.findall(r"\b[IDE]\b", row_text, flags=re.I)
                if tokens:
                    count = min(len(tokens), len(canonical_po_letters))
                    for j in range(count):
                        po_letter = canonical_po_letters[j]
                        level = tokens[j].upper()
                        po_key = f"PO-{po_letter.lower()}"
                        po_levels[po_key] = level

            if not po_levels:
                continue

            def po_sort_key(po_key: str) -> int:
                letter = po_key.split("-")[-1]
                if canonical_po_letters and letter in canonical_po_letters:
                    return canonical_po_letters.index(letter)
                return ord(letter[0]) - ord("A")

            mapped_pos = sorted(po_levels.keys(), key=po_sort_key)

            results.append(
                {
                    "CO": co,
                    "Description": desc,
                    "Mapped_POs": mapped_pos,
                    "PO_Levels": po_levels,
                }
            )
            seen_cos.add(co)
            last_po_levels = po_levels

    return results

def extract_co_descriptions(filepath):
    doc = fitz.open(filepath)
    co_text_parts = []
    capture = False

    for page in doc:
        text = page.get_text("text")

        text = re.sub(r"Document Code No\..*?Page No\..*", "", text, flags=re.I)
        text = re.sub(r"Rev\..*?Page", "", text, flags=re.I)
        text = re.sub(r"\s+", " ", text)

        if re.search(r"Course Outcomes?|Intended Learning Outcomes", text, re.I):
            capture = True

        if capture:
            co_text_parts.append(text)

        if re.search(r"\bIII\.\s*Course Outline\b", text, re.I):
            break

    if not co_text_parts:
        return {}

    section_text = " ".join(co_text_parts)

    section_text = re.sub(
        r"Document Code No\..*?(Page No\.\s*\d+\s*of\s*\d+)?",
        "",
        section_text,
        flags=re.I,
    )
    section_text = re.sub(
        r"Rev\..*?Effective Date.*?\d{1,2}\s*of\s*\d+",
        "",
        section_text,
        flags=re.I,
    )
    section_text = re.sub(
        r"\bFM[\-–_ ]?USTP[\-–_ ]?ACAD[\-–_ ]?\d+\b",
        "",
        section_text,
        flags=re.I,
    )

    section_text = re.sub(
        r"\bUSTP[\-–_ ]?ACAD[\-–_ ]?\d+\b",
        "",
        section_text,
        flags=re.I,
    )

    section_text = re.sub(
        r"\bUSTP\s*Core\s*Values\s*:", "\n---CORE_VALUES---", section_text, flags=re.I
    )
    section_text = re.sub(
        r"\bProgram\s*Educational\s*Objectives\s*:",
        "\n---PEO_SECTION---",
        section_text,
        flags=re.I,
    )
    section_text = re.sub(
        r"\bPEO\d\s*:", "\n---PEO_SECTION---", section_text, flags=re.I
    )

    section_text = re.sub(
        r"\b(I|D|E)\b(?:\s+\b(I|D|E)\b)+", "", section_text, flags=re.I
    )

    section_text = re.sub(r"\s+", " ", section_text).strip()

    co_descriptions = {}
    pattern = re.compile(
        r"(CO\s*\d+)\s*[:\-]\s*(.*?)(?=\bCO\s*\d+[:\-]|\-\-\-CORE_VALUES\-\-\-|\-\-\-PEO_SECTION\-\-\-|\bIII\.|\bIV\.|$)",
        re.I | re.S,
    )

    for match in pattern.finditer(section_text):
        co = match.group(1).replace(" ", "").upper()
        desc = match.group(2).strip()
        desc = re.sub(r"\s+", " ", desc).strip()
        co_descriptions[co] = desc

    return co_descriptions

def merge_co_data(mapping_list, desc_map):
    enriched = []

    for entry in mapping_list:
        co = entry["CO"]

        desc_from_table = entry.get("Description", "").strip()
        desc_from_text = desc_map.get(co, "").strip()

        if desc_from_text:
            final_desc = desc_from_text
        elif desc_from_table:
            final_desc = desc_from_table
        else:
            final_desc = ""

        enriched.append(
            {
                "CO": co,
                "Description": final_desc,
                "PO_Levels": entry.get("PO_Levels", {}),
            }
        )

    def co_number(e):
        m = re.search(r"\d+", e["CO"])
        return int(m.group()) if m else 9999

    enriched_sorted = sorted(enriched, key=co_number)

    formatted = []
    for item in enriched_sorted:
        formatted.append(
            {
                "course_outcome_code": item["CO"],
                "course_outcome_description": item["Description"],
                "outcome_mapping": item["PO_Levels"],  # {"PO-A": "I", ...}
            }
        )

    return formatted

def extract_co_po(filepath):
    mapping = extract_po_mapping(filepath)
    descriptions = extract_co_descriptions(filepath)
    return merge_co_data(mapping, descriptions)

def main(filepath, output="co_po_mapping.json"):
    print(f"Processing: {filepath}")
    result = extract_co_po(filepath)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"Done → {output}")


if __name__ == "__main__":
    main("IT212 - Fundl of DBMS Syllabus-APPROVED.pdf")

def _norm(s: str) -> str:
    return (s or "").strip().upper().replace(" ", "")

@transaction.atomic
def apply_extracted_override(loaded_course, extracted_items):
    """
    extracted_items:
    [
      {
        "course_outcome_code": "CO1",
        "course_outcome_description": "...",
        "outcome_mapping": {"PO-A": "I", "PO-B": "E"}
      },
      ...
    ]
    """
    program = loaded_course.course.program
    program_outcomes = ProgramOutcome.objects.filter(program=program)

    po_lookup = {_norm(po.program_outcome_code): po for po in program_outcomes}

    summary = {
        "created_course_outcomes": 0,
        "updated_course_outcomes": 0,
        "skipped_course_outcomes": 0,
        "created_mappings": 0,
        "updated_mappings": 0,
        "skipped_pos_missing_in_program": [],  # POs found in PDF but not in DB
    }

    for item in extracted_items:
        co_code = _norm(item.get("course_outcome_code"))
        co_desc = (item.get("course_outcome_description") or "").strip()
        po_levels = item.get("outcome_mapping") or {}

        if not co_code:
            continue

        co_obj, created = CourseOutcome.objects.get_or_create(
            loaded_course=loaded_course,
            course_outcome_code=co_code,
            defaults={"course_outcome_description": co_desc},
        )

        if created:
            summary["created_course_outcomes"] += 1
        else:
            if co_desc:  # only overwrite if PDF gave a description
                co_obj.course_outcome_description = co_desc
                co_obj.save(update_fields=["course_outcome_description"])
                summary["updated_course_outcomes"] += 1
            else:
                summary["skipped_course_outcomes"] += 1

        # Override PO mappings for this CO
        for raw_po_code, level in po_levels.items():
            po_code_norm = _norm(raw_po_code)   # e.g., "PO-A"
            level_norm = _norm(level)           # "I"/"D"/"E"

            if level_norm not in {"I", "D", "E"}:
                continue

            po_obj = po_lookup.get(po_code_norm)
            if not po_obj:
                summary["skipped_pos_missing_in_program"].append(raw_po_code)
                continue

            mapping_obj, map_created = OutcomeMapping.objects.get_or_create(
                program_outcome=po_obj,
                course_outcome=co_obj,
                defaults={"outcome_mapping": level_norm},
            )

            if map_created:
                summary["created_mappings"] += 1
            else:
                # overwrite always
                mapping_obj.outcome_mapping = level_norm
                mapping_obj.save(update_fields=["outcome_mapping"])
                summary["updated_mappings"] += 1

    summary["skipped_pos_missing_in_program"] = sorted(
        list(set(summary["skipped_pos_missing_in_program"]))
    )
    return summary