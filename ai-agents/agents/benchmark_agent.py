from typing import Dict, Any, List
from .matching_agent import MatchingAgent
from .recruiter_agent import RecruiterAgent

# 3 Job Descriptions
BENCHMARK_JOBS = [
    {
        "id": "job_ai_01",
        "title": "Senior AI & LLM Systems Engineer",
        "company": "Anthropic Partner Labs",
        "location": "Bangalore / Remote",
        "experience_level": "senior",
        "required_skills": ["Python", "PyTorch", "LLMs", "LangChain", "Vector Databases", "FastAPI", "Docker"],
        "preferred_skills": ["vLLM", "Hugging Face", "CUDA", "Kubernetes"],
        "description": "Architect and deploy high-throughput multi-agent AI pipelines, fine-tune open weights LLMs, and optimize vector retrieval latency."
    },
    {
        "id": "job_fs_02",
        "title": "Lead Full-Stack React & Node Developer",
        "company": "HyperScale Cloud Inc",
        "location": "Mumbai / Hybrid",
        "experience_level": "mid",
        "required_skills": ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "MongoDB", "REST APIs"],
        "preferred_skills": ["GraphQL", "PostgreSQL", "Redis", "Docker"],
        "description": "Design responsive, high-performance web applications using React, Next.js 14+, and Node.js microservices with real-time WebSocket feeds."
    },
    {
        "id": "job_devops_03",
        "title": "Cloud DevOps & Kubernetes Engineer",
        "company": "FinTech Matrix Systems",
        "location": "Delhi / Pune",
        "experience_level": "mid",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Python"],
        "preferred_skills": ["Prometheus", "Grafana", "Ansible", "Helm", "Go"],
        "description": "Manage multi-region AWS cloud infrastructure, automate GitOps deployments with Kubernetes and Terraform, and achieve 99.99% system uptime."
    }
]

# 10 Realistic Candidate Profiles
BENCHMARK_CANDIDATES = [
    {
        "id": "cand_01",
        "name": "Alex Mercer",
        "title": "AI & Distributed Systems Specialist",
        "experience_type": "experienced",
        "skills": ["Python", "PyTorch", "LLMs", "LangChain", "Vector Databases", "FastAPI", "Docker", "vLLM", "TypeScript", "React"],
        "college": "IIT Bombay",
        "score": 96,
        "profile_completion": 95,
        "verified_badge": True,
        "github_url": "https://github.com/alexmercer-ai",
        "hackathons": ["National GenAI Hackathon 2024 Winner", "Smart India Hackathon"],
        "certificates": ["AWS Certified AI Practitioner", "DeepLearning.AI Spec"],
        "projects": [{"name": "Autonomous Multi-Agent Swarm", "technologies": ["LangChain", "FastAPI", "ChromaDB"]}],
        "summary": "AI Engineer with 4 years building production LLM inference engines and multi-agent coordination frameworks."
    },
    {
        "id": "cand_02",
        "name": "Priya Sharma",
        "title": "Machine Learning & NLP Researcher",
        "experience_type": "experienced",
        "skills": ["Python", "PyTorch", "Hugging Face", "LLMs", "NLP", "FastAPI", "SQL", "Pandas", "Scikit-Learn"],
        "college": "IIIT Hyderabad",
        "score": 92,
        "profile_completion": 90,
        "verified_badge": True,
        "github_url": "https://github.com/priyasharma-nlp",
        "hackathons": ["Kaggle Grandmaster Competition 2023"],
        "certificates": ["TensorFlow Developer Certificate"],
        "projects": [{"name": "Biomedical Text Extraction", "technologies": ["PyTorch", "BERT"]}],
        "summary": "Specialized in fine-tuning transformer architectures, model compression, and retrieval-augmented generation."
    },
    {
        "id": "cand_03",
        "name": "Rohan Verma",
        "title": "Senior Full-Stack & UI Architect",
        "experience_type": "experienced",
        "skills": ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "MongoDB", "GraphQL", "Docker"],
        "college": "BITS Pilani",
        "score": 94,
        "profile_completion": 92,
        "verified_badge": True,
        "github_url": "https://github.com/rohan-webdev",
        "hackathons": ["DevFest Web Hackathon 2024"],
        "certificates": ["Meta Certified Front-End Specialist"],
        "projects": [{"name": "Next.js Collaborative Canvas", "technologies": ["React", "Next.js", "WebSockets"]}],
        "summary": "5+ years crafting modern, accessible, high-concurrency web portals with TypeScript and React."
    },
    {
        "id": "cand_04",
        "name": "Sneha Kulkarni",
        "title": "Frontend Engineer & Design Systems",
        "experience_type": "experienced",
        "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "Node.js", "Figma"],
        "college": "COEP Pune",
        "score": 86,
        "profile_completion": 85,
        "verified_badge": True,
        "github_url": "https://github.com/sneha-ui",
        "hackathons": ["Hack Pune 2023 Runner Up"],
        "certificates": ["Google UX Certification"],
        "projects": [{"name": "Design Tokens Library", "technologies": ["React", "Tailwind"]}],
        "summary": "Creative frontend engineer focused on micro-animations, design tokens, and fluid component libraries."
    },
    {
        "id": "cand_05",
        "name": "Vikram Malhotra",
        "title": "Cloud Infrastructure & SRE Specialist",
        "experience_type": "experienced",
        "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Python", "Prometheus", "Grafana"],
        "college": "Delhi Technological University (DTU)",
        "score": 95,
        "profile_completion": 94,
        "verified_badge": True,
        "github_url": "https://github.com/vikram-devops",
        "hackathons": ["AWS Community Day Hackathon"],
        "certificates": ["AWS Solutions Architect Professional", "Certified Kubernetes Administrator (CKA)"],
        "projects": [{"name": "Automated Multi-Cluster GitOps", "technologies": ["Kubernetes", "ArgoCD", "Terraform"]}],
        "summary": "Cloud veteran with expertise in zero-downtime blue/green deployments and multi-region Kubernetes topologies."
    },
    {
        "id": "cand_06",
        "name": "Ananya Roy",
        "title": "DevOps Engineer & Security Advocate",
        "experience_type": "experienced",
        "skills": ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Bash", "Python", "GitLab CI"],
        "college": "Jadavpur University",
        "score": 88,
        "profile_completion": 88,
        "verified_badge": True,
        "github_url": "https://github.com/ananya-cloud",
        "hackathons": ["Kolkata FOSS Hackathon"],
        "certificates": ["HashiCorp Certified: Terraform Associate"],
        "projects": [{"name": "Secure Container Scanning Pipeline", "technologies": ["Docker", "Trivy", "GitHub Actions"]}],
        "summary": "DevOps practitioner passionate about Shift-Left DevSecOps and automated container vulnerability triage."
    },
    {
        "id": "cand_07",
        "name": "Arjun Nair",
        "title": "Junior Full-Stack & Python Developer",
        "experience_type": "fresher",
        "skills": ["Python", "Django", "JavaScript", "React", "SQL", "Git", "HTML/CSS"],
        "college": "NIT Trichy",
        "score": 79,
        "profile_completion": 80,
        "verified_badge": False,
        "github_url": "https://github.com/arjun-nair",
        "hackathons": ["In-house College Hackathon 2024"],
        "certificates": ["FreeCodeCamp Responsive Web Design"],
        "projects": [{"name": "Campus Event Booking Portal", "technologies": ["Django", "React"]}],
        "summary": "Recent CS graduate with active open-source contributions and foundational grasp of full-stack engineering."
    },
    {
        "id": "cand_08",
        "name": "Divya Deshmukh",
        "title": "Junior Data Scientist & ML Enthusiast",
        "experience_type": "fresher",
        "skills": ["Python", "Pandas", "NumPy", "Scikit-Learn", "SQL", "Tableau", "FastAPI"],
        "college": "VJTI Mumbai",
        "score": 81,
        "profile_completion": 82,
        "verified_badge": False,
        "github_url": "https://github.com/divya-data",
        "hackathons": ["Smart City Hackathon 2024"],
        "certificates": ["IBM Data Science Professional"],
        "projects": [{"name": "Traffic Prediction Time-Series", "technologies": ["Python", "Prophet"]}],
        "summary": "Aspiring data scientist equipped with solid statistics, predictive modeling, and REST endpoint construction."
    },
    {
        "id": "cand_09",
        "name": "Karan Singhania",
        "title": "Backend Go & Cloud Engineer",
        "experience_type": "experienced",
        "skills": ["Go", "Docker", "Kubernetes", "PostgreSQL", "Kafka", "AWS", "gRPC", "Linux"],
        "college": "IIT Kharagpur",
        "score": 90,
        "profile_completion": 89,
        "verified_badge": True,
        "github_url": "https://github.com/karan-go",
        "hackathons": ["GopherCon India Hackathon"],
        "certificates": ["Confluent Certified Developer for Kafka"],
        "projects": [{"name": "High-Throughput Financial Streamer", "technologies": ["Go", "Kafka", "PostgreSQL"]}],
        "summary": "Specialist in event-driven streaming, low-latency microservices, and concurrency patterns in Go."
    },
    {
        "id": "cand_10",
        "name": "Tanvi Bhatia",
        "title": "Fresher Web Developer",
        "experience_type": "fresher",
        "skills": ["HTML", "CSS", "JavaScript", "React", "Bootstrap", "Git"],
        "college": "Amity University",
        "score": 68,
        "profile_completion": 65,
        "verified_badge": False,
        "github_url": "",
        "hackathons": [],
        "certificates": ["Udemy Web Development 2023"],
        "projects": [{"name": "Personal Portfolio Website", "technologies": ["HTML", "CSS", "JS"]}],
        "summary": "Motivated beginner software developer actively learning React and modern JavaScript workflows."
    }
]

class BenchmarkAgent:
    """
    Benchmark Demonstration Agent:
    Evaluates 10 resumes against 3 job descriptions and produces ranked candidate lists
    with multi-agent compatibility breakdowns and executive briefs.
    """

    @classmethod
    def run_benchmark(cls, target_job_id: str = "") -> Dict[str, Any]:
        results_by_job = {}

        for job in BENCHMARK_JOBS:
            job_id = job["id"]
            if target_job_id and job_id != target_job_id:
                continue

            ranked_list = []
            for cand in BENCHMARK_CANDIDATES:
                # Run matching agent
                match = MatchingAgent.match(cand, job)
                
                # Executive summary (fast batch mode)
                brief = RecruiterAgent.generate_summary(cand["name"], job["title"], match, use_llm=False)

                ranked_list.append({
                    "candidateId": cand["id"],
                    "candidateName": cand["name"],
                    "title": cand["title"],
                    "college": cand["college"],
                    "experienceType": cand["experience_type"],
                    "overallScore": match["overallScore"],
                    "skillMatch": match["skillMatch"],
                    "experienceMatch": match["experienceMatch"],
                    "projectRelevance": match["projectRelevance"],
                    "culturalFit": match["culturalFit"],
                    "hackathonBonus": match["hackathonBonus"],
                    "verdict": match["verdict"],
                    "matchedSkills": match["matchedSkills"],
                    "missingSkills": match["missingSkills"],
                    "strengths": match["strengths"],
                    "gaps": match["gaps"],
                    "summary": match["summary"],
                    "hiringRecommendation": brief.get("hiringRecommendation", "Hire with Upskilling"),
                    "executiveSummary": brief.get("executiveSummary", match["summary"])
                })

            # Sort descending by overallScore
            ranked_list.sort(key=lambda x: x["overallScore"], reverse=True)
            
            # Assign ranks
            for i, r in enumerate(ranked_list):
                r["rank"] = i + 1

            results_by_job[job_id] = {
                "job": job,
                "totalCandidatesEvaluated": len(ranked_list),
                "rankings": ranked_list
            }

        return {
            "status": "success",
            "benchmarkJobs": BENCHMARK_JOBS,
            "resultsByJob": results_by_job
        }
