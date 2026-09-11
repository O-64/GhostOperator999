import os
import re
import fitz  # PyMuPDF
from typing import Optional, Dict, Any, Union
from .llm_client import call_llm, clean_json_response

class ResumeAgent:
    """
    Resume Agent: Extracts candidate information from PDF / text resumes using
    PyMuPDF (fitz) and Google Gemini / Groq LLMs.
    """

    @staticmethod
    def extract_text_from_pdf(pdf_source: Union[str, bytes]) -> str:
        """Extract all raw text from a PDF file path or binary stream."""
        text = ""
        try:
            if isinstance(pdf_source, str):
                doc = fitz.open(pdf_source)
            else:
                doc = fitz.open(stream=pdf_source, filetype="pdf")
                
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
        except Exception as e:
            print(f"[ResumeAgent] Error reading PDF: {e}")
            # If plain text string passed by mistake
            if isinstance(pdf_source, str) and not pdf_source.endswith(".pdf"):
                return pdf_source
        return text.strip()

    @classmethod
    def parse_resume(cls, resume_input: Union[str, bytes], is_pdf: bool = True) -> Dict[str, Any]:
        """
        Parses resume content and extracts structured candidate profile.
        """
        if is_pdf:
            raw_text = cls.extract_text_from_pdf(resume_input)
        else:
            raw_text = str(resume_input)

        if not raw_text or len(raw_text.strip()) < 20:
            return {
                "error": "Resume content is empty or unreadable.",
                "raw_text": raw_text
            }

        prompt = f"""
Analyze the following resume text and extract all candidate details into structured JSON format.

RESUME CONTENT:
\"\"\"
{raw_text[:6000]}
\"\"\"

Return a JSON object with EXACTLY the following structure:
{{
  "name": "Candidate Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "title": "Current or Target Professional Title",
  "experience_type": "fresher" or "experienced",
  "total_years_experience": 0,
  "summary": "2-3 sentence executive summary of the candidate's background",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "education": [
    {{
      "degree": "B.Tech / BS in Computer Science",
      "institution": "University / College Name",
      "year": "Graduation Year"
    }}
  ],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Duration (e.g., 2022 - 2024)",
      "highlights": ["Key accomplishment or tech used"]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech 1", "Tech 2"],
      "impact": "Measurable result or outcome"
    }}
  ],
  "certificates": [
    {{
      "name": "Certificate Name",
      "issuer": "Issuing Organization",
      "year": "Year"
    }}
  ],
  "hackathons": [
    {{
      "name": "Hackathon Name",
      "role": "Role / Award",
      "year": "Year"
    }}
  ],
  "github_url": "https://github.com/...",
  "linkedin_url": "https://linkedin.com/in/...",
  "portfolio_url": ""
}}
"""
        system_inst = "You are an expert AI Resume Screening Agent. Extract precise candidate information into valid JSON."
        raw_llm_out = call_llm(prompt, system_inst)
        parsed = clean_json_response(raw_llm_out)

        # Basic validation & heuristic fallback if LLM gave empty fields
        if not parsed.get("name") or parsed.get("name") == "Candidate Full Name":
            # Heuristic name extraction from first line
            lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
            if lines:
                parsed["name"] = lines[0][:50]
                
        if not parsed.get("email"):
            email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
            if email_match:
                parsed["email"] = email_match.group(0)

        if not parsed.get("skills"):
            common_skills = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Docker", "AWS", "Machine Learning", "Git"]
            found = [s for s in common_skills if re.search(rf"\b{re.escape(s)}\b", raw_text, re.IGNORECASE)]
            parsed["skills"] = found if found else ["General Software Development"]

        parsed["raw_char_count"] = len(raw_text)
        return parsed
