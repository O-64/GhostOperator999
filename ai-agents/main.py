import os
import io
import json
import base64
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

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
    call_llm,
    clean_json_response
)

app = FastAPI(
    title="AI Talent Matrix — Multi-Agent Intelligence Engine",
    description="Python FastAPI Multi-Agent system for resume screening, job matching, PPT intelligence, and fraud detection.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend & Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ─── Pydantic Request Models ──────────────────────────────────────────────────
class ResumeParseRequest(BaseModel):
    resumeText: Optional[str] = None
    base64Data: Optional[str] = None
    fileName: Optional[str] = None
    isPdf: Optional[bool] = True

class JobAnalyzeRequest(BaseModel):
    title: Optional[str] = "Software Engineer"
    company: Optional[str] = "Tech Company"
    description: str

class MatchRequest(BaseModel):
    candidate: Dict[str, Any]
    job: Dict[str, Any]

class SkillGapRequest(BaseModel):
    candidateSkills: List[str]
    targetSkills: List[str]
    roleTitle: Optional[str] = "Software Engineer"

class RecruiterSummaryRequest(BaseModel):
    candidateName: str
    roleTitle: str
    matchData: Dict[str, Any]
    gapData: Optional[Dict[str, Any]] = None
    fraudData: Optional[Dict[str, Any]] = None

class PipelineRunRequest(BaseModel):
    candidate: Any
    job: Any
    isPdf: Optional[bool] = False

class InterviewStartRequest(BaseModel):
    roleTitle: str
    candidateSkills: Optional[List[str]] = []
    seniority: Optional[str] = "Mid"

class InterviewRespondRequest(BaseModel):
    question: str
    answer: str
    roleTitle: str

class PPTAnalyzeRequest(BaseModel):
    base64Data: Optional[str] = None
    textContent: Optional[str] = None
    fileName: Optional[str] = "presentation.pptx"
    isPptx: Optional[bool] = True

class FraudCheckRequest(BaseModel):
    candidate: Dict[str, Any]
    resumeText: Optional[str] = ""

class GitHubAnalyzeRequest(BaseModel):
    githubUrl: str

class BenchmarkRunRequest(BaseModel):
    jobId: Optional[str] = None

class CopilotSearchRequest(BaseModel):
    query: str
    candidates: Optional[List[Dict[str, Any]]] = []

# ─── 0. Health & Status ───────────────────────────────────────────────────────
@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "AI Multi-Agent Recruitment Engine",
        "agents": [
            "Resume Agent", "Job Agent", "Matching Agent", "Skill Gap Agent",
            "Recruiter Agent", "Coordinator Agent", "Interview Agent",
            "PPT Analyzer Agent", "Fraud Detection Agent", "GitHub Agent",
            "Hackathon Agent", "Benchmark Demo Agent"
        ],
        "version": "1.0.0"
    }

# ─── 1. Resume Agent ───────────────────────────────────────────────────────────
@app.post("/api/agents/resume/parse")
async def parse_resume_endpoint(payload: ResumeParseRequest):
    try:
        if payload.base64Data:
            clean_b64 = payload.base64Data.split(",")[-1]
            pdf_bytes = base64.b64decode(clean_b64)
            result = ResumeAgent.parse_resume(pdf_bytes, is_pdf=True)
        elif payload.resumeText:
            result = ResumeAgent.parse_resume(payload.resumeText, is_pdf=False)
        else:
            raise HTTPException(status_code=400, detail="Either base64Data or resumeText must be provided.")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/resume/upload-and-parse")
async def upload_and_parse_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        is_pdf = file.filename.lower().endswith(".pdf")
        result = ResumeAgent.parse_resume(content, is_pdf=is_pdf)
        
        # Save local copy
        save_path = os.path.join(UPLOADS_DIR, file.filename)
        with open(save_path, "wb") as f:
            f.write(content)
        result["fileUrl"] = f"/uploads/{file.filename}"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 2. Job Agent ─────────────────────────────────────────────────────────────
@app.post("/api/agents/job/analyze")
def analyze_job_endpoint(payload: JobAnalyzeRequest):
    try:
        return JobAgent.analyze_job(payload.description, payload.title, payload.company)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 3. Matching Agent ─────────────────────────────────────────────────────────
@app.post("/api/agents/match")
def match_endpoint(payload: MatchRequest):
    try:
        return MatchingAgent.match(payload.candidate, payload.job)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 4. Skill Gap Agent ───────────────────────────────────────────────────────
@app.post("/api/agents/skill-gap")
def skill_gap_endpoint(payload: SkillGapRequest):
    try:
        return SkillGapAgent.analyze_skill_gap(payload.candidateSkills, payload.targetSkills, payload.roleTitle)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 5. Recruiter Agent ───────────────────────────────────────────────────────
@app.post("/api/agents/recruiter-summary")
def recruiter_summary_endpoint(payload: RecruiterSummaryRequest):
    try:
        return RecruiterAgent.generate_summary(
            payload.candidateName,
            payload.roleTitle,
            payload.matchData,
            payload.gapData,
            payload.fraudData
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 6. Coordinator Agent (Full Pipeline) ─────────────────────────────────────
@app.post("/api/agents/pipeline/run")
def pipeline_run_endpoint(payload: PipelineRunRequest):
    try:
        return CoordinatorAgent.run_pipeline(payload.candidate, payload.job, is_pdf=payload.isPdf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 7. AI Mock Interview Agent ──────────────────────────────────────────────
@app.post("/api/agents/interview/start")
def interview_start_endpoint(payload: InterviewStartRequest):
    try:
        return InterviewAgent.start_interview(payload.roleTitle, payload.candidateSkills, payload.seniority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/interview/respond")
def interview_respond_endpoint(payload: InterviewRespondRequest):
    try:
        return InterviewAgent.evaluate_response(payload.question, payload.answer, payload.roleTitle)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 8. AI PPT Analyzer ───────────────────────────────────────────────────────
@app.post("/api/agents/ppt/analyze")
def ppt_analyze_endpoint(payload: PPTAnalyzeRequest):
    try:
        if payload.base64Data:
            clean_b64 = payload.base64Data.split(",")[-1]
            ppt_bytes = base64.b64decode(clean_b64)
            return PPTAnalyzerAgent.analyze_presentation(ppt_bytes, file_name=payload.fileName, is_pptx=payload.isPptx)
        elif payload.textContent:
            return PPTAnalyzerAgent.analyze_presentation(payload.textContent, file_name=payload.fileName, is_pptx=False)
        else:
            raise HTTPException(status_code=400, detail="No presentation content provided.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 9. Trust & Fraud Prevention System ───────────────────────────────────────
@app.post("/api/agents/fraud/check")
def fraud_check_endpoint(payload: FraudCheckRequest):
    try:
        return FraudDetectionAgent.audit_candidate(payload.candidate, payload.resumeText)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 10. Team & GitHub Contribution Analytics ─────────────────────────────────
@app.post("/api/agents/github/analyze")
def github_analyze_endpoint(payload: GitHubAnalyzeRequest):
    try:
        return GitHubAgent.analyze_github_profile(payload.githubUrl)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 11. Hackathon-to-Hiring Pipeline ────────────────────────────────────────
@app.get("/api/agents/hackathon/data")
def hackathon_data_endpoint():
    try:
        return HackathonAgent.get_hackathon_pipeline_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 12. Benchmark Demo (10 Resumes x 3 Jobs Ranking) ─────────────────────────
@app.post("/api/agents/benchmark/run")
def benchmark_run_endpoint(payload: BenchmarkRunRequest = None):
    try:
        job_id = payload.jobId if payload else None
        return BenchmarkAgent.run_benchmark(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 13. Recruiter AI Copilot Enhanced ────────────────────────────────────────
@app.post("/api/agents/copilot/nl-search")
def copilot_nl_search(payload: CopilotSearchRequest):
    try:
        query = payload.query
        candidates = payload.candidates or []

        prompt = f"""
Recruiter natural language search query: "{query}"

Available candidates summary:
{json.dumps([{'id': c.get('id'), 'name': c.get('name'), 'skills': c.get('skills', [])[:8], 'location': c.get('location'), 'score': c.get('score')} for c in candidates[:15]], indent=2)}

Analyze the query intent (e.g. skills needed, location, experience type) and return:
{{
  "responseMessage": "Recruiter-friendly assistant response describing findings",
  "matchedCandidateIds": ["cand_id1", "cand_id2"],
  "highlightedCriteria": ["Extracted criterion 1", "Extracted criterion 2"]
}}
"""
        raw = call_llm(prompt, "You are a smart recruiter copilot. Return strictly valid JSON.")
        parsed = clean_json_response(raw)

        # Fallback keyword match if LLM returned empty ids
        matched_ids = parsed.get("matchedCandidateIds", [])
        if not matched_ids and candidates:
            q_lower = query.lower()
            matched = [
                c.get("id") for c in candidates
                if any(s.lower() in q_lower for s in c.get("skills", []))
                or (c.get("location") and c.get("location").lower() in q_lower)
            ]
            matched_ids = matched[:5] if matched else [c.get("id") for c in candidates[:3]]

        return {
            "query": query,
            "response": parsed.get("responseMessage", f"Found matching candidates based on '{query}'."),
            "matchedCandidateIds": matched_ids,
            "highlightedCriteria": parsed.get("highlightedCriteria", [query])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 14. File Upload (Cloudinary + Local) ──────────────────────────────────────
@app.post("/api/upload")
async def upload_file_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        file_name = file.filename or f"upload_{os.urandom(4).hex()}.bin"
        safe_name = "".join(c for c in file_name if c.isalnum() or c in "._- ")

        local_path = os.path.join(UPLOADS_DIR, safe_name)
        with open(local_path, "wb") as f:
            f.write(content)

        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        api_secret = os.getenv("CLOUDINARY_API_SECRET")
        api_key = os.getenv("CLOUDINARY_API_KEY")

        cloudinary_url = None
        if cloud_name and api_secret and api_key:
            try:
                import cloudinary
                import cloudinary.uploader
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret
                )
                res = cloudinary.uploader.upload(content, public_id=safe_name, resource_type="auto")
                cloudinary_url = res.get("secure_url") or res.get("url")
            except Exception as c_err:
                print(f"[Cloudinary Warning] {c_err}")

        public_url = cloudinary_url or f"/uploads/{safe_name}"

        return {
            "success": True,
            "fileName": safe_name,
            "url": public_url,
            "isCloudinary": bool(cloudinary_url),
            "sizeBytes": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
