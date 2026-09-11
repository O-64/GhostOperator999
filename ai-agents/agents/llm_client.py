import os
import json
import re
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
# Hugging Face Inference Providers (router.huggingface.co) — OpenAI-compatible.
# Accepts either HUGGINGFACE_API_KEY or the more common HF_TOKEN name so
# whichever the user pastes into .env just works.
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "") or os.getenv("HF_TOKEN", "")

# Model IDs are configurable via env vars so a future provider-side deprecation
# doesn't require touching code — just update the .env value.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
# Free, solid instruction-tuned model well supported on HF Inference Providers.
HUGGINGFACE_MODEL = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-3.1-8B-Instruct")


def clean_json_response(raw_text: str) -> dict:
    """Extract and parse JSON from markdown code blocks or raw text."""
    if not raw_text:
        return {}

    # Strip ```json ... ``` or ``` ... ```
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())

    # First try direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Try finding the first { ... } or [ ... ]
    match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    return {"raw_output": raw_text}


def call_gemini(prompt: str, system_instruction: str = "") -> str:
    """Call Google Gemini (2.5 Flash by default) via native HTTP request."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    full_text = f"System: {system_instruction}\n\nUser: {prompt}" if system_instruction else prompt
    payload = {
        "contents": [
            {
                "parts": [{"text": full_text}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "")
    return ""


def call_groq(prompt: str, system_instruction: str = "", model: str = None) -> str:
    """Call Groq Cloud API with OpenAI-compatible endpoint."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")

    model = model or GROQ_MODEL
    url = "https://api.groq.com/openai/v1/chat/completions"
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 2048
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
    return ""


def call_huggingface(prompt: str, system_instruction: str = "", model: str = None) -> str:
    """
    Call a Hugging Face model via the Inference Providers router
    (https://router.huggingface.co) using the OpenAI-compatible
    /v1/chat/completions endpoint. Works with a standard HF access token
    (either HUGGINGFACE_API_KEY or HF_TOKEN in .env).
    """
    if not HUGGINGFACE_API_KEY:
        raise ValueError("HUGGINGFACE_API_KEY / HF_TOKEN is not set")

    model = model or HUGGINGFACE_MODEL
    url = "https://router.huggingface.co/v1/chat/completions"
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 2048,
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=45) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
    return ""


def call_llm(prompt: str, system_instruction: str = "", prefer_json: bool = True) -> str:
    """
    Unified LLM caller. Tries providers in order, based on whichever API
    keys are present in .env: Gemini -> Groq -> Hugging Face.
    Every agent already has a deterministic fallback for when this returns
    an empty string (no keys configured / all providers failed), so the
    platform stays fully functional even with zero LLM keys set.
    """
    if prefer_json and system_instruction:
        system_instruction += "\nOutput ONLY valid JSON without extra explanatory text or markdown backticks."
    elif prefer_json and not system_instruction:
        system_instruction = "You are an expert AI system. Output ONLY valid JSON."

    # 1) Gemini 2.5 Flash (fast + generous free tier)
    try:
        if GEMINI_API_KEY:
            res = call_gemini(prompt, system_instruction)
            if res.strip():
                return res
    except Exception as e:
        print(f"[LLM WARNING] Gemini call failed: {e}. Falling back to Groq...")

    # 2) Groq (very low latency)
    try:
        if GROQ_API_KEY:
            res = call_groq(prompt, system_instruction)
            if res.strip():
                return res
    except Exception as e:
        print(f"[LLM WARNING] Groq call failed: {e}. Falling back to Hugging Face...")

    # 3) Hugging Face Inference Providers (works with the free HF token tier)
    try:
        if HUGGINGFACE_API_KEY:
            res = call_huggingface(prompt, system_instruction)
            if res.strip():
                return res
    except Exception as e:
        print(f"[LLM WARNING] Hugging Face call failed: {e}.")

    return ""
