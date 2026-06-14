import io
import pdfplumber

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text_list = []
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                content = page.extract_text()
                if content:
                    text_list.append(content)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file: {str(e)}")
        
    return "\n".join(text_list)
