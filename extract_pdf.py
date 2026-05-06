import fitz # PyMuPDF
import os

pdf_dir = "New updates/collecting data/"
output_dir = "public/templates/"
os.makedirs(output_dir, exist_ok=True)

pdfs = [
    ("website 1 insp pdf.pdf", "template1.png"),
    ("website 2 insp pdf.pdf", "template2.png")
]

for pdf_file, out_file in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf_file)
    if os.path.exists(pdf_path):
        doc = fitz.open(pdf_path)
        page = doc.load_page(0) # First page
        pix = page.get_pixmap(dpi=150) # High quality
        out_path = os.path.join(output_dir, out_file)
        pix.save(out_path)
        print(f"Saved {out_path}")
    else:
        print(f"Not found: {pdf_path}")
