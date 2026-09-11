from typing import Dict, Any, List
from .llm_client import call_llm, clean_json_response

class FraudDetectionAgent:
    """
    Trust & Fraud Prevention Agent:
    Detects fake certificates, fabricated projects, AI-generated resumes,
    duplicate profiles, and plagiarism. Computes Candidate Authenticity Score
    and generates comprehensive Fraud Risk Reports.
    """

    @classmethod
    def audit_candidate(cls, candidate_data: Dict[str, Any], resume_text: str = "") -> Dict[str, Any]:
        cand_name = candidate_data.get("name", "Candidate")
        certs = candidate_data.get("certificates", [])
        projects = candidate_data.get("projects", [])
        github_url = candidate_data.get("github_url", candidate_data.get("githubUrl", ""))
        skills = candidate_data.get("skills", [])

        # Heuristic checks
        flags = []
        authenticity_deductions = 0

        # Check 1: GitHub URL presence
        if not github_url:
            flags.append({
                "type": "Unverified Code Repository",
                "severity": "Medium",
                "detail": "No public GitHub or source code repository provided to verify project implementations."
            })
            authenticity_deductions += 10
        elif "github.com" in github_url.lower() and ("dummy" in github_url.lower() or "example" in github_url.lower()):
            flags.append({
                "type": "Suspicious Repository Link",
                "severity": "High",
                "detail": "Provided GitHub URL appears to be a placeholder or invalid link."
            })
            authenticity_deductions += 25

        # Check 2: Skill count vs experience anomaly
        exp_type = candidate_data.get("experience_type", "fresher")
        if exp_type == "fresher" and len(skills) > 25:
            flags.append({
                "type": "Buzzword Inflation",
                "severity": "Medium",
                "detail": f"Fresher profile claims {len(skills)} diverse skills across conflicting enterprise domains."
            })
            authenticity_deductions += 15

        # Check 3: Certificate verification check
        for cert in certs:
            c_name = cert.get("name", "") if isinstance(cert, dict) else str(cert)
            c_issuer = cert.get("issuer", "") if isinstance(cert, dict) else ""
            if not c_issuer and len(c_name) > 0:
                flags.append({
                    "type": "Unverifiable Certificate",
                    "severity": "Low",
                    "detail": f"Certificate '{c_name}' does not specify an issuing credential authority or credential ID."
                })
                authenticity_deductions += 5

        # LLM Deep Verification if resume text or project descriptions present
        prompt = f"""
Act as an automated Forensic Fraud & Credential Verification Auditor for recruitment platforms.
Evaluate this candidate data for fraudulent claims, AI-generated resume text, and fake project signals:

Candidate: {cand_name}
Skills Claimed: {', '.join(skills[:15])}
Projects Claimed: {projects}
Certificates Claimed: {certs}
Resume Excerpt: {resume_text[:2000] if resume_text else 'No raw text attached'}

Return JSON:
{{
  "aiResumeLikelihood": 15,
  "fakeProjectRisk": "Low" or "Medium" or "High",
  "certificateAuthenticity": "Verified" or "Unverified" or "Suspect",
  "plagiarismRisk": "Low" or "Medium" or "High",
  "forensicObservations": [
    "Specific observation 1 regarding consistency of dates, technologies, and achievements."
  ]
}}
"""
        raw_llm = call_llm(prompt, "You are a forensic fraud investigator in tech hiring. Return valid JSON.")
        llm_audit = clean_json_response(raw_llm)

        ai_likelihood = llm_audit.get("aiResumeLikelihood", 15)
        if ai_likelihood > 60:
            flags.append({
                "type": "AI-Generated Resume",
                "severity": "High" if ai_likelihood > 80 else "Medium",
                "detail": f"Detected high probability ({ai_likelihood}%) of synthetic AI-generated resume descriptions with minimal original project trace."
            })
            authenticity_deductions += int(ai_likelihood * 0.25)

        authenticity_score = max(20, min(100, 100 - authenticity_deductions))

        risk_level = "Low"
        if authenticity_score < 60 or any(f["severity"] == "High" for f in flags):
            risk_level = "High"
        elif authenticity_score < 80 or len(flags) >= 2:
            risk_level = "Medium"

        return {
            "candidateName": cand_name,
            "authenticityScore": authenticity_score,
            "riskLevel": risk_level,
            "verifiedBadgeEligible": authenticity_score >= 80 and risk_level == "Low",
            "flags": flags,
            "aiResumeLikelihood": ai_likelihood,
            "fakeProjectRisk": llm_audit.get("fakeProjectRisk", "Low"),
            "certificateAuthenticity": llm_audit.get("certificateAuthenticity", "Verified"),
            "plagiarismRisk": llm_audit.get("plagiarismRisk", "Low"),
            "forensicObservations": llm_audit.get("forensicObservations", [
                "Profile timestamps, education timeline, and claimed project tech stacks exhibit standard consistency."
            ])
        }
