import camelot

tables = camelot.read_pdf("IT212 - Fundl of DBMS Syllabus-APPROVED.pdf", pages="all", flavor="lattice")

output_path = "camelot_tables_output.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(f"Found tables: {len(tables)}\n\n")
    for i, t in enumerate(tables):
        f.write(f"=== TABLE {i} ===\n")
        f.write(t.df.to_string())
        f.write("\n\n" + "=" * 60 + "\n\n")

print(f"✅ Done! Tables saved to: {output_path}")
