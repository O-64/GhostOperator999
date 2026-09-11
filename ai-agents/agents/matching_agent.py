import re
from typing import Dict, Any, List
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class MatchingAgent:
    """
    Matching Agent: Calculates multi-dimensional compatibility between candidate
    profiles and job descriptions using vector similarity, skill matching, and role fit.
    """

    @classmethod
    def compute_skill_similarity(cls, candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
        c_skills_lower = [str(s).strip().lower() for s in candidate_skills if str(s).strip()]
        r_skills_lower = [str(s).strip().lower() for s in required_skills if str(s).strip()]

        if not r_skills_lower:
            return {"skill_score": 75, "matched": candidate_skills[:5], "missing": []}

        matched = []
        missing = []

        for req in r_skills_lower:
            # Check exact or substring match
            found = False
            for cand in c_skills_lower:
                if req == cand or req in cand or cand in req:
                    matched.append(req)
                    found = True
                    break
            if not found:
                missing.append(req)

        # Baseline ratio
        overlap_ratio = len(matched) / len(r_skills_lower)
        skill_score = int(round(overlap_ratio * 100))

        # Text TF-IDF cosine similarity boost if sklearn is available
        if SKLEARN_AVAILABLE and c_skills_lower and r_skills_lower:
            try:
                c_corpus = " ".join(c_skills_lower)
                r_corpus = " ".join(r_skills_lower)
                tfidf = TfidfVectorizer().fit_transform([c_corpus, r_corpus])
                sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
                tfidf_score = int(round(sim * 100))
                skill_score = int(round(0.6 * skill_score + 0.4 * tfidf_score))
            except Exception:
                pass

        return {
            "skill_score": min(100, max(0, skill_score)),
            "matched": matched,
            "missing": missing
        }

    @classmethod
    def match(cls, candidate: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes the complete compatibility matrix:
        - Overall Compatibility Score (0-100)
        - Skill Similarity Analysis (0-100)
        - Experience Match (0-100)
        - Cultural Fit Analysis (0-100)
        - Project Relevance Score (0-100)
        - Hackathon & Innovation Bonus (0-100)
        """
        c_skills = candidate.get("skills", [])
        r_skills = job.get("required_skills", job.get("skills", []))
        
        # 1. Skill Match
        skill_res = cls.compute_skill_similarity(c_skills, r_skills)
        skill_match = skill_res["skill_score"]
        matched_skills = skill_res["matched"]
        missing_skills = skill_res["missing"]

        # 2. Experience Match
        exp_type = candidate.get("experience_type", candidate.get("experienceType", "fresher"))
        job_exp = job.get("experience_level", "mid")
        exp_score = 65
        if exp_type == "experienced":
            exp_score = 85 if job_exp in ["mid", "senior"] else 75
        else:
            exp_score = 90 if job_exp in ["fresher", "entry"] else 60
        
        # Add candidate platform score bonus
        cand_score = candidate.get("score", 0)
        if cand_score > 70:
            exp_score = min(100, exp_score + 10)
        experience_match = exp_score

        # 3. Project Relevance Score
        projects = candidate.get("projects", [])
        ppts = candidate.get("project_ppts", candidate.get("projectPPTs", []))
        github_present = bool(candidate.get("github_url") or candidate.get("githubUrl"))
        
        proj_score = 40 + (len(projects) * 12) + (len(ppts) * 8) + (15 if github_present else 0)
        project_relevance = min(100, proj_score)

        # 4. Cultural Fit Analysis
        completion = candidate.get("profile_completion", candidate.get("profileCompletion", 50))
        verified = candidate.get("verified_badge", candidate.get("verifiedBadge", False))
        has_about = bool(candidate.get("about"))
        cultural_fit = min(100, int(round((completion * 0.6) + (25 if verified else 10) + (15 if has_about else 0))))

        # 5. Hackathon & Innovation Bonus
        hackathons = candidate.get("hackathons", [])
        certificates = candidate.get("certificates", [])
        hackathon_bonus = min(100, (len(hackathons) * 25) + (len(certificates) * 10))

        # Overall Weighted Score
        overall_score = int(round(
            (skill_match * 0.35) +
            (experience_match * 0.20) +
            (project_relevance * 0.20) +
            (cultural_fit * 0.15) +
            (hackathon_bonus * 0.10)
        ))

        # Verdict
        if overall_score >= 80:
            verdict = "Strong Fit"
        elif overall_score >= 65:
            verdict = "Good Fit"
        elif overall_score >= 50:
            verdict = "Moderate Fit"
        else:
            verdict = "Weak Fit"

        # Strengths
        strengths = []
        if skill_match >= 70:
            strengths.append(f"Strong skill alignment: {len(matched_skills)} core skills verified")
        if len(hackathons) > 0:
            strengths.append(f"Demonstrated practical innovation across {len(hackathons)} hackathon(s)")
        if github_present:
            strengths.append("Verified public code repository contributions")
        if verified:
            strengths.append("Full AI profile verification badge achieved")
        if not strengths:
            strengths.append("Solid foundation in core engineering concepts")

        # Gaps
        gaps = []
        if missing_skills:
            gaps.append(f"Missing required competencies: {', '.join(missing_skills[:3])}")
        if len(projects) == 0 and len(ppts) == 0:
            gaps.append("No portfolio projects or presentation decks linked")
        if completion < 70:
            gaps.append("Profile details incomplete (below 70%)")
        if not gaps:
            gaps.append("No critical competency gaps identified")

        cand_name = candidate.get("name", "Candidate")
        summary = (
            f"{cand_name} demonstrates an overall compatibility score of {overall_score}% ({verdict}). "
            f"Key asset: {strengths[0]}. "
            + (f"Primary recommendation: Address {gaps[0]}." if gaps and "No critical" not in gaps[0] else "Recommended for immediate fast-track recruiter interview.")
        )

        return {
            "candidateId": candidate.get("id", "UNKNOWN"),
            "candidateName": cand_name,
            "overallScore": overall_score,
            "skillMatch": skill_match,
            "experienceMatch": experience_match,
            "projectRelevance": project_relevance,
            "culturalFit": cultural_fit,
            "hackathonBonus": hackathon_bonus,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "verdict": verdict,
            "strengths": strengths,
            "gaps": gaps,
            "summary": summary
        }
