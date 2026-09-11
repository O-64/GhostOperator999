from typing import Dict, Any, Union
from .resume_agent import ResumeAgent
from .job_agent import JobAgent
from .matching_agent import MatchingAgent
from .skill_gap_agent import SkillGapAgent
from .recruiter_agent import RecruiterAgent

class CoordinatorAgent:
    """
    Coordinator Agent: LangChain / Graph-style pipeline orchestrator that chains
    Resume Agent -> Job Agent -> Matching Agent -> Skill Gap Agent -> Recruiter Agent
    into an integrated, explainable talent evaluation workflow.
    """

    @classmethod
    def run_pipeline(
        cls,
        candidate_data: Union[Dict[str, Any], str, bytes],
        job_data: Union[Dict[str, Any], str],
        is_pdf: bool = False
    ) -> Dict[str, Any]:
        pipeline_log = []

        # Step 1: Resume Agent
        pipeline_log.append({"agent": "Coordinator Agent", "status": "Initiating Multi-Agent Evaluation Pipeline"})
        if isinstance(candidate_data, (str, bytes)) and (is_pdf or isinstance(candidate_data, bytes)):
            pipeline_log.append({"agent": "Resume Agent", "status": "Extracting structured candidate data from document via PyMuPDF + LLM"})
            parsed_candidate = ResumeAgent.parse_resume(candidate_data, is_pdf=is_pdf)
        elif isinstance(candidate_data, dict):
            pipeline_log.append({"agent": "Resume Agent", "status": "Ingesting pre-parsed candidate profile"})
            parsed_candidate = candidate_data
        else:
            pipeline_log.append({"agent": "Resume Agent", "status": "Extracting candidate profile from plain text"})
            parsed_candidate = ResumeAgent.parse_resume(str(candidate_data), is_pdf=False)

        # Step 2: Job Agent
        pipeline_log.append({"agent": "Job Agent", "status": "Analyzing Job Description requirements and taxonomy"})
        if isinstance(job_data, dict):
            parsed_job = job_data
        else:
            parsed_job = JobAgent.analyze_job(str(job_data))

        # Step 3: Matching Agent
        pipeline_log.append({"agent": "Matching Agent", "status": "Calculating multi-dimensional vector and skill compatibility matrix"})
        match_result = MatchingAgent.match(parsed_candidate, parsed_job)

        # Step 4: Skill Gap Agent
        pipeline_log.append({"agent": "Skill Gap Agent", "status": "Mapping competency gaps against ESCO/O*NET skill taxonomy"})
        cand_skills = parsed_candidate.get("skills", [])
        job_skills = parsed_job.get("required_skills", parsed_job.get("skills", []))
        role_title = parsed_job.get("title", "Target Role")
        gap_result = SkillGapAgent.analyze_skill_gap(cand_skills, job_skills, role_title)

        # Step 5: Recruiter Agent
        pipeline_log.append({"agent": "Recruiter Agent", "status": "Synthesizing executive brief, risk analysis, and tailored interview questions"})
        cand_name = parsed_candidate.get("name", "Candidate")
        recruiter_brief = RecruiterAgent.generate_summary(cand_name, role_title, match_result, gap_result)

        pipeline_log.append({"agent": "Coordinator Agent", "status": "Pipeline completed successfully with explainable dossier"})

        return {
            "status": "success",
            "candidate": parsed_candidate,
            "job": parsed_job,
            "matching": match_result,
            "skillGap": gap_result,
            "recruiterBrief": recruiter_brief,
            "pipelineExecutionLog": pipeline_log
        }
