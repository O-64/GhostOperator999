from typing import Dict, Any, List
from .llm_client import call_llm, clean_json_response

# Standard Taxonomy DB (ESCO / O*NET aligned)
SKILL_TAXONOMY_DB = {
    "python": {
        "category": "Backend & AI",
        "related": ["fastapi", "django", "pytorch", "numpy", "pandas"],
        "courses": ["Python for Everybody (Coursera)", "Complete Python Bootcamp (Udemy)"],
        "est_hours": 30
    },
    "react": {
        "category": "Frontend",
        "related": ["javascript", "typescript", "next.js", "tailwind", "redux"],
        "courses": ["Epic React by Kent C. Dodds", "Meta Front-End Developer (Coursera)"],
        "est_hours": 40
    },
    "docker": {
        "category": "DevOps & Cloud",
        "related": ["kubernetes", "ci/cd", "linux", "aws"],
        "courses": ["Docker Mastery (Udemy)", "KodeKloud Docker for Beginners"],
        "est_hours": 25
    },
    "kubernetes": {
        "category": "DevOps & Cloud",
        "related": ["docker", "helm", "cloud", "aws", "gcp"],
        "courses": ["CKA Certification Guide", "Kubernetes Up and Running"],
        "est_hours": 50
    },
    "machine learning": {
        "category": "AI / Data Science",
        "related": ["python", "pytorch", "tensorflow", "scikit-learn", "math"],
        "courses": ["Machine Learning Specialization by Andrew Ng (Coursera)"],
        "est_hours": 60
    },
    "system design": {
        "category": "Architecture",
        "related": ["distributed systems", "microservices", "caching", "sql", "nosql"],
        "courses": ["Grokking the System Design Interview", "Alex Xu System Design"],
        "est_hours": 45
    },
    "aws": {
        "category": "Cloud Infrastructure",
        "related": ["cloud", "docker", "terraform", "serverless", "s3", "ec2"],
        "courses": ["AWS Certified Solutions Architect Associate (Stephane Maarek)"],
        "est_hours": 40
    },
    "node.js": {
        "category": "Backend",
        "related": ["express", "javascript", "typescript", "mongodb", "rest"],
        "courses": ["The Complete Node.js Developer Course (Andrew Mead)"],
        "est_hours": 35
    },
    "sql": {
        "category": "Databases",
        "related": ["postgresql", "mysql", "indexing", "database design"],
        "courses": ["Stanford Online Databases Course", "SQL for Data Science"],
        "est_hours": 20
    }
}

class SkillGapAgent:
    """
    Skill Gap Agent: Identifies missing and weak competencies by comparing
    candidate skill vectors with job profiles using standard ESCO / O*NET taxonomies.
    Generates targeted upskilling recommendations and learning paths.
    """

    @classmethod
    def analyze_skill_gap(cls, candidate_skills: List[str], target_skills: List[str], role_title: str = "") -> Dict[str, Any]:
        c_skills_lower = set(s.strip().lower() for s in candidate_skills)
        t_skills_lower = set(s.strip().lower() for s in target_skills)

        # 1. Missing skills
        missing = []
        for target in t_skills_lower:
            # Check if covered or closely matched
            if not any(target in c or c in target for c in c_skills_lower):
                missing.append(target)

        # 2. Taxonomy lookup for learning resources & gap severity
        gap_details = []
        for m in missing:
            key = m.lower()
            tax_info = None
            for db_key, val in SKILL_TAXONOMY_DB.items():
                if db_key in key or key in db_key:
                    tax_info = val
                    break
            
            if tax_info:
                gap_details.append({
                    "skill": m.title(),
                    "category": tax_info["category"],
                    "priority": "High" if len(gap_details) < 2 else "Medium",
                    "estimatedHours": tax_info["est_hours"],
                    "recommendedCourse": tax_info["courses"][0],
                    "relatedSkills": tax_info["related"]
                })
            else:
                gap_details.append({
                    "skill": m.title(),
                    "category": "Technical Competency",
                    "priority": "High" if len(gap_details) < 2 else "Medium",
                    "estimatedHours": 30,
                    "recommendedCourse": f"Foundations of {m.title()} on Coursera / FreeCodeCamp",
                    "relatedSkills": []
                })

        # 3. LLM enrichment if available for personalized upskilling advice
        prompt = f"""
A candidate is targeting the role: '{role_title or "Software Engineer"}'.
Their current skills: {', '.join(candidate_skills) if candidate_skills else 'None listed'}
Target required skills: {', '.join(target_skills) if target_skills else 'Standard tech skills'}
Missing skills identified: {', '.join(missing) if missing else 'None'}

Generate a short upskilling action plan in JSON:
{{
  "readiness_summary": "1-2 sentence assessment of candidate readiness",
  "recommended_projects": ["Project idea 1 to bridge gaps", "Project idea 2"],
  "fast_track_advice": "Key strategy to quickly qualify for this role"
}}
"""
        raw_llm = call_llm(prompt, "You are a senior tech career coach and skills gap expert. Return valid JSON.")
        llm_enrichment = clean_json_response(raw_llm)

        return {
            "totalRequired": len(target_skills),
            "matchedCount": len(target_skills) - len(missing),
            "missingCount": len(missing),
            "missingSkills": [m.title() for m in missing],
            "gapBreakdown": gap_details,
            "readinessSummary": llm_enrichment.get("readiness_summary", f"Candidate covers {max(0, len(target_skills) - len(missing))}/{len(target_skills)} core requirements."),
            "recommendedProjects": llm_enrichment.get("recommended_projects", ["Build a full-stack demo showcasing the missing skills in an end-to-end repository."]),
            "fastTrackAdvice": llm_enrichment.get("fast_track_advice", "Focus on hands-on project implementations rather than solely video tutorials to prove competency.")
        }
