import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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

# ─── Individual test functions (each is self-contained & thread-safe) ──────────

def test_benchmark():
    bench_res = BenchmarkAgent.run_benchmark()
    assert bench_res["status"] == "success"
    assert len(bench_res["resultsByJob"]) == 3
    for j_id, data in bench_res["resultsByJob"].items():
        top = data["rankings"][0]
        print(f"  [Benchmark] Role: {data['job']['title']} | Rank#1: {top['candidateName']} ({top['overallScore']}%) | {top['verdict']}")
        assert len(data["rankings"]) == 10
    return "Benchmark Agent OK"

def test_job_agent():
    job_res = JobAgent.analyze_job(
        "Looking for a Senior Python and PyTorch engineer to build LLM agents and FastAPI services.",
        "AI Engineer", "OpenLab"
    )
    assert "required_skills" in job_res
    print(f"  [Job Agent]  Parsed Skills: {job_res.get('required_skills')}")
    return "Job Agent OK"

def test_matching_agent():
    c_sample = BENCHMARK_CANDIDATES[0]
    j_sample = BENCHMARK_JOBS[0]
    match_res = MatchingAgent.match(c_sample, j_sample)
    assert match_res["overallScore"] > 0
    print(f"  [Matching]   Score: {match_res['overallScore']}% | Verdict: {match_res['verdict']}")
    return "Matching Agent OK"

def test_skill_gap():
    gap_res = SkillGapAgent.analyze_skill_gap(
        ["React", "JavaScript"], ["Python", "Docker", "Kubernetes"], "DevOps Engineer"
    )
    assert len(gap_res["missingSkills"]) > 0
    print(f"  [SkillGap]   Missing: {gap_res['missingSkills']}")
    return "Skill Gap Agent OK"

def test_fraud_detection():
    fraud_res = FraudDetectionAgent.audit_candidate(BENCHMARK_CANDIDATES[0])
    assert fraud_res["authenticityScore"] > 0
    print(f"  [Fraud]      Authenticity: {fraud_res['authenticityScore']}% | Risk: {fraud_res['riskLevel']}")
    return "Fraud Detection Agent OK"

def test_interview_agent():
    int_q = InterviewAgent.start_interview("Full-Stack React Engineer", ["React", "TypeScript", "Node.js"])
    assert len(int_q.get("questions", [])) > 0
    print(f"  [Interview]  Questions generated: {len(int_q.get('questions', []))}")
    return "Interview Agent OK"

def test_ppt_analyzer():
    ppt_res = PPTAnalyzerAgent.analyze_presentation(
        "Problem: Cloud storage latency is high.\nSolution: Distributed decentralized P2P caching.\nTech: Go, Docker, Redis.\nBusiness: $2B addressable market.",
        file_name="pitch_deck.pptx", is_pptx=False
    )
    assert ppt_res["overallPitchScore"] > 0
    print(f"  [PPT]        Pitch Score: {ppt_res['overallPitchScore']} | AI Detection: {ppt_res['aiContentDetection']['verdict']}")
    return "PPT Analyzer Agent OK"

def test_github_agent():
    gh_res = GitHubAgent.analyze_github_profile("https://github.com/torvalds")
    assert gh_res["verified"] is True
    print(f"  [GitHub]     Verified: {gh_res['verified']} | Collab Score: {gh_res['collaborationScore']}")
    return "GitHub Agent OK"

def test_hackathon_agent():
    hack_res = HackathonAgent.get_hackathon_pipeline_data()
    assert len(hack_res["activeHackathons"]) > 0
    print(f"  [Hackathon]  Active: {len(hack_res['activeHackathons'])} | Fast-Tracked: {hack_res['stats']['fastTrackedCandidates']}")
    return "Hackathon Agent OK"


# ─── Parallel Test Runner ─────────────────────────────────────────────────────

ALL_TESTS = [
    test_benchmark,
    test_job_agent,
    test_matching_agent,
    test_skill_gap,
    test_fraud_detection,
    test_interview_agent,
    test_ppt_analyzer,
    test_github_agent,
    test_hackathon_agent,
]

def run_tests(max_workers: int = 4):
    """Run all agent tests in parallel using a thread pool."""
    print(f"\n{'='*60}")
    print(f"  GhostOperator Multi-Agent Test Suite (parallel, workers={max_workers})")
    print(f"{'='*60}\n")

    start = time.time()
    passed = []
    failed = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_fn = {executor.submit(fn): fn.__name__ for fn in ALL_TESTS}
        for future in as_completed(future_to_fn):
            fn_name = future_to_fn[future]
            try:
                result = future.result()
                passed.append(result)
                print(f"  [PASS] {result}")
            except Exception as exc:
                failed.append(fn_name)
                print(f"  [FAIL] {fn_name} -- {exc}")

    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"  Results: {len(passed)} passed, {len(failed)} failed | Time: {elapsed:.1f}s")
    print(f"{'='*60}\n")

    if failed:
        print(f"  FAILED tests: {failed}")
        sys.exit(1)
    else:
        print("  >>> ALL MULTI-AGENT SUB-SYSTEMS OPERATIONAL! <<<")

if __name__ == "__main__":
    # Default: 4 parallel workers. Pass --workers=N to override.
    workers = 4
    for arg in sys.argv[1:]:
        if arg.startswith("--workers="):
            workers = int(arg.split("=")[1])
    run_tests(max_workers=workers)
