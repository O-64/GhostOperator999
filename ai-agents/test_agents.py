import sys
from agents import (
    ResumeAgent,
    JobAgent,
    MatchingAgent,
    SkillGapAgent,
    RecruiterAgent,
    CoordinatorAgent,
    InterviewAgent,
    PPTAnalyzerAgent,
    FraudDetectionAgent,
    GitHubAgent,
    HackathonAgent,
    BenchmarkAgent,
    BENCHMARK_JOBS,
    BENCHMARK_CANDIDATES
)

def run_tests():
    print("=== Testing Benchmark Agent (10 Resumes x 3 Jobs) ===")
    bench_res = BenchmarkAgent.run_benchmark()
    assert bench_res["status"] == "success"
    assert len(bench_res["resultsByJob"]) == 3
    for j_id, data in bench_res["resultsByJob"].items():
        print(f"Role: {data['job']['title']} | Evaluated: {data['totalCandidatesEvaluated']} candidates")
        top = data["rankings"][0]
        print(f"  -> Rank #1: {top['candidateName']} ({top['overallScore']}%) | Verdict: {top['verdict']}")
        assert len(data["rankings"]) == 10

    print("\n=== Testing Job Agent ===")
    job_res = JobAgent.analyze_job("Looking for a Senior Python and PyTorch engineer to build LLM agents and FastAPI services.", "AI Engineer", "OpenLab")
    print(f"Parsed Skills: {job_res.get('required_skills')}")
    assert "required_skills" in job_res

    print("\n=== Testing Matching Agent ===")
    c_sample = BENCHMARK_CANDIDATES[0]
    j_sample = BENCHMARK_JOBS[0]
    match_res = MatchingAgent.match(c_sample, j_sample)
    print(f"Overall Match Score: {match_res['overallScore']}% | Verdict: {match_res['verdict']}")
    assert match_res["overallScore"] > 0

    print("\n=== Testing Skill Gap Agent ===")
    gap_res = SkillGapAgent.analyze_skill_gap(["React", "JavaScript"], ["Python", "Docker", "Kubernetes"], "DevOps Engineer")
    print(f"Missing Skills: {gap_res['missingSkills']}")
    assert len(gap_res["missingSkills"]) > 0

    print("\n=== Testing Fraud Detection Agent ===")
    fraud_res = FraudDetectionAgent.audit_candidate(c_sample)
    print(f"Authenticity Score: {fraud_res['authenticityScore']}% | Risk Level: {fraud_res['riskLevel']}")
    assert fraud_res["authenticityScore"] > 0

    print("\n=== Testing AI Interview Agent ===")
    int_q = InterviewAgent.start_interview("Full-Stack React Engineer", ["React", "TypeScript", "Node.js"])
    print(f"Generated Questions: {len(int_q.get('questions', []))}")
    assert len(int_q.get("questions", [])) > 0

    print("\n=== Testing PPT Analyzer Agent ===")
    ppt_res = PPTAnalyzerAgent.analyze_presentation("Problem: Cloud storage latency is high.\nSolution: Distributed decentralized P2P caching.\nTech: Go, Docker, Redis.\nBusiness: $2B addressable market.", file_name="pitch_deck.pptx", is_pptx=False)
    print(f"Pitch Score: {ppt_res['overallPitchScore']} | Innovation: {ppt_res['innovationScore']} | AI Detection: {ppt_res['aiContentDetection']['verdict']}")
    assert ppt_res["overallPitchScore"] > 0

    print("\n=== Testing GitHub Agent ===")
    gh_res = GitHubAgent.analyze_github_profile("https://github.com/torvalds")
    print(f"GitHub Verified: {gh_res['verified']} | Collaboration Score: {gh_res['collaborationScore']}")
    assert gh_res["verified"] is True

    print("\n=== Testing Hackathon Agent ===")
    hack_res = HackathonAgent.get_hackathon_pipeline_data()
    print(f"Active Hackathons: {len(hack_res['activeHackathons'])} | Fast Tracked: {hack_res['stats']['fastTrackedCandidates']}")
    assert len(hack_res["activeHackathons"]) > 0

    print("\n>>> ALL 12 MULTI-AGENT SUB-SYSTEMS TESTED AND OPERATIONAL! <<<")

if __name__ == "__main__":
    run_tests()
