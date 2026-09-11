from typing import Dict, Any, List

class HackathonAgent:
    """
    Hackathon-to-Hiring Pipeline Agent:
    Tracks national and campus hackathon performance, team rankings,
    winner analytics, project innovation scores, and fast-tracks top performers to recruiters.
    """

    @classmethod
    def get_hackathon_pipeline_data(cls) -> Dict[str, Any]:
        return {
            "activeHackathons": [
                {
                    "id": "hack_2025_01",
                    "title": "National GenAI & Agentic Hackathon 2025",
                    "organizer": "TechCouncil & Google for Developers",
                    "participants": 1420,
                    "teamsCount": 380,
                    "status": "Completed - Hiring Open",
                    "winnerTeam": "NeuralNova",
                    "topRankings": [
                        {
                            "rank": 1,
                            "team": "NeuralNova",
                            "project": "Autonomous Multi-Agent DevOps SRE",
                            "innovationScore": 98,
                            "techScore": 96,
                            "members": ["Alex Mercer (Lead)", "Priya Sharma (ML)", "Rohan Verma (Cloud)"],
                            "fastTrackHiring": True
                        },
                        {
                            "rank": 2,
                            "team": "CyberPulse",
                            "project": "Zero-Knowledge Identity Verification for FinTech",
                            "innovationScore": 94,
                            "techScore": 92,
                            "members": ["Aarav Patel", "Sneha Kulkarni"],
                            "fastTrackHiring": True
                        },
                        {
                            "rank": 3,
                            "team": "QuantumStack",
                            "project": "High-Throughput Vector Search Database Engine",
                            "innovationScore": 91,
                            "techScore": 94,
                            "members": ["Kavya Iyer", "Aditya Nair"],
                            "fastTrackHiring": True
                        }
                    ]
                },
                {
                    "id": "hack_2025_02",
                    "title": "Global Web3 & Distributed Systems Summit",
                    "organizer": "DevPost Global",
                    "participants": 890,
                    "teamsCount": 210,
                    "status": "Under Evaluation",
                    "winnerTeam": "TBD",
                    "topRankings": [
                        {
                            "rank": 1,
                            "team": "AetherMesh",
                            "project": "Decentralized P2P Inference Network",
                            "innovationScore": 95,
                            "techScore": 90,
                            "members": ["Devansh Joshi", "Tanya Sen"],
                            "fastTrackHiring": True
                        }
                    ]
                }
            ],
            "stats": {
                "totalHackathonCandidates": 48,
                "fastTrackedCandidates": 16,
                "averageInnovationScore": 92.4,
                "recruiterOfferRate": "68%"
            }
        }
