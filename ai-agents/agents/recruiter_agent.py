from typing import Dict, Any
from .llm_client import call_llm, clean_json_response

class RecruiterAgent:
    """
    Recruiter Agent: Synthesizes multi-agent evaluations into concise, recruiter-friendly
    hiring intelligence dossiers with tailored interview probing questions and hiring verdicts.
    """

    @classmethod
    def generate_summary(
        cls,
        candidate_name: str,
        role_title: str,
        match_data: Dict[str, Any],
        gap_data: Dict[str, Any] = None,
        fraud_data: Dict[str, Any] = None,
        use_llm: bool = True
    ) -> Dict[str, Any]:
        overall_score = match_data.get("overallScore", 70)
        verdict = match_data.get("verdict", "Good Fit")
        strengths = match_data.get("strengths", [])
        gaps = match_data.get("gaps", [])

        if not use_llm:
            recommendation = "Strong Hire" if overall_score >= 80 else ("Hire with Upskilling" if overall_score >= 65 else "Further Technical Evaluation")
            return {
                "executiveSummary": f"{candidate_name} exhibits an overall compatibility score of {overall_score}% ({verdict}) for {role_title}. Demonstrates strong core competencies with verified project alignment.",
                "keyStrengths": strengths if strengths else ["Demonstrated problem solving foundation"],
                "areasForInvestigation": gaps if gaps else ["Validate practical depth in live architecture session"],
                "hiringRecommendation": recommendation,
                "tailoredInterviewQuestions": [
                    {
                        "question": f"How have you designed and scaled solutions addressing {strengths[0] if strengths else 'core system performance'}?",
                        "whatToLookFor": "Architectural maturity, trade-off understanding, and failure handling."
                    }
                ],
                "salaryRangeEstimate": "Competitive Market Standard (₹18 LPA - ₹28 LPA / $90k - $130k)",
                "overallScore": overall_score,
                "candidateName": candidate_name,
                "roleTitle": role_title
            }

        prompt = f"""
Act as an elite Senior Technical Recruiter. Generate an executive candidate evaluation dossier for a hiring manager.

CANDIDATE: {candidate_name}
TARGET ROLE: {role_title}
OVERALL COMPATIBILITY: {overall_score}% ({verdict})
IDENTIFIED STRENGTHS: {', '.join(strengths)}
IDENTIFIED GAPS: {', '.join(gaps)}
AUTHENTICITY / FRAUD STATUS: {fraud_data.get('riskLevel', 'Low') if fraud_data else 'Low'} Risk

Return a JSON object with EXACTLY this structure:
{{
  "executiveSummary": "2-3 crisp sentences synthesizing candidate fit, seniority alignment, and high-impact traits.",
  "keyStrengths": [
    "Strength 1 with commercial context",
    "Strength 2 with technical evidence"
  ],
  "areasForInvestigation": [
    "Specific gap or risk area to probe in interview"
  ],
  "tailoredInterviewQuestions": [
    {{
      "question": "Deep technical interview question targeted at their skill gap or project claim",
      "whatToLookFor": "Expected technical depth in a strong answer"
    }},
    {{
      "question": "Architectural or behavioral question to evaluate problem solving",
      "whatToLookFor": "Expected engineering maturity indicators"
    }}
  ],
  "hiringRecommendation": "Strong Hire" or "Hire with Upskilling" or "Further Technical Evaluation" or "Decline",
  "salaryRangeEstimate": "e.g., $95,000 - $125,000 or ₹18 LPA - ₹26 LPA depending on market"
}}
"""
        system_inst = "You are an executive Technical Recruiter Agent. Generate actionable, unbiased hiring briefs in valid JSON."
        raw_llm = call_llm(prompt, system_inst)
        parsed = clean_json_response(raw_llm)

        if not parsed.get("executiveSummary"):
            parsed["executiveSummary"] = f"{candidate_name} presents an overall score of {overall_score}% for {role_title}. Demonstrates strong core capability with notable alignment in required technical areas."
            parsed["keyStrengths"] = strengths if strengths else ["Demonstrated problem solving foundation"]
            parsed["areasForInvestigation"] = gaps if gaps else ["Validate practical depth in live architecture session"]
            parsed["hiringRecommendation"] = "Hire with Upskilling" if overall_score >= 65 else "Further Technical Evaluation"
            parsed["tailoredInterviewQuestions"] = [
                {
                    "question": f"Can you explain how you designed your primary project and handled scalability bottlenecks?",
                    "whatToLookFor": "Clear understanding of distributed bottlenecks, caching, and data modeling."
                }
            ]

        parsed["overallScore"] = overall_score
        parsed["candidateName"] = candidate_name
        parsed["roleTitle"] = role_title
        return parsed
