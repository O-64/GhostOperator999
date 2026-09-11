from typing import Dict, Any, List
from .llm_client import call_llm, clean_json_response

class JobAgent:
    """
    Job Agent: Analyzes Job Descriptions and extracts structured role requirements,
    required & preferred skills, experience tier, and project expectations.
    """

    @classmethod
    def analyze_job(cls, job_text: str, title: str = "", company: str = "") -> Dict[str, Any]:
        if not job_text or len(job_text.strip()) < 10:
            return {
                "title": title or "Software Engineer",
                "company": company or "Tech Company",
                "required_skills": [],
                "preferred_skills": [],
                "experience_level": "mid"
            }

        prompt = f"""
Analyze the following Job Description and extract structured role expectations into JSON format.

JOB DETAILS:
Title: {title}
Company: {company}
Text:
\"\"\"
{job_text[:4000]}
\"\"\"

Return a JSON object with EXACTLY this structure:
{{
  "title": "Normalized Job Title",
  "company": "Company Name",
  "experience_level": "fresher" or "mid" or "senior" or "lead",
  "min_years_experience": 0,
  "required_skills": ["Mandatory Skill 1", "Mandatory Skill 2"],
  "preferred_skills": ["Nice to have Skill 1", "Nice to have Skill 2"],
  "key_responsibilities": [
    "Key responsibility 1",
    "Key responsibility 2"
  ],
  "educational_requirements": "e.g., Bachelor's degree in CS or equivalent",
  "domain": "AI / Web / Cloud / Mobile / Data",
  "summary": "Concise summary of the role and core expectations"
}}
"""
        system_inst = "You are an expert Job Requirements Analysis Agent. Parse job specifications with high precision into JSON."
        raw_llm_out = call_llm(prompt, system_inst)
        parsed = clean_json_response(raw_llm_out)

        if not parsed.get("required_skills"):
            parsed["required_skills"] = ["Problem Solving", "Software Engineering"]

        return parsed
