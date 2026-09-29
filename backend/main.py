import os
import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from groq import Groq


# ============================================================
# LOAD .ENV MANUALLY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"


def load_env_file():
    """
    Simple .env loader.
    Avoids needing pydantic-settings/python-dotenv.
    """

    if not ENV_FILE.exists():
        return

    try:
        for line in ENV_FILE.read_text(
            encoding="utf-8"
        ).splitlines():

            line = line.strip()

            if not line:
                continue

            if line.startswith("#"):
                continue

            if "=" not in line:
                continue

            key, value = line.split(
                "=",
                1
            )

            key = key.strip()
            value = value.strip()

            if (
                len(value) >= 2
                and value[0] == '"'
                and value[-1] == '"'
            ):
                value = value[1:-1]

            if (
                len(value) >= 2
                and value[0] == "'"
                and value[-1] == "'"
            ):
                value = value[1:-1]

            os.environ.setdefault(
                key,
                value
            )

    except Exception as exc:
        print(
            "WARNING: Could not read .env:",
            exc
        )


load_env_file()


# ============================================================
# GROQ CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

# Current Groq model suitable for this project.
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)


if GROQ_API_KEY:
    groq_client = Groq(
        api_key=GROQ_API_KEY
    )
else:
    groq_client = None


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="EduPath AI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://edu-path-ai-seven.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "message": "EduPath AI backend is running",
        "groq_configured": bool(
            GROQ_API_KEY
        ),
        "model": GROQ_MODEL,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq_configured": bool(
            GROQ_API_KEY
        ),
        "model": GROQ_MODEL,
    }


# ============================================================
# HELPER
# ============================================================

def require_groq():

    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "GROQ_API_KEY is missing. "
                "Add GROQ_API_KEY=your_key to backend/.env"
            ),
        )

    if groq_client is None:
        raise HTTPException(
            status_code=500,
            detail="Groq client could not be initialized.",
        )


def call_groq(
    system_prompt: str,
    user_prompt: str,
) -> dict[str, Any]:

    require_groq()

    try:

        response = groq_client.chat.completions.create(

            model=GROQ_MODEL,

            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            temperature=0.3,

            max_completion_tokens=6000,

            response_format={
                "type": "json_object"
            },
        )

        content = (
            response.choices[0]
            .message
            .content
        )

        if not content:
            raise Exception(
                "Groq returned an empty response."
            )

        # Remove possible markdown fences
        content = content.strip()

        if content.startswith(
            "```json"
        ):
            content = content[
                7:
            ]

        if content.endswith(
            "```"
        ):
            content = content[
                :-3
            ]

        content = content.strip()

        result = json.loads(
            content
        )

        if not isinstance(
            result,
            dict
        ):
            raise Exception(
                "Groq response was not a JSON object."
            )

        return result

    except Exception as exc:

        print(
            "\n================ GROQ ERROR ================\n"
        )

        print(
            repr(exc)
        )

        print(
            "\n==============================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Groq API error: {str(exc)}",
        )


# ============================================================
# PATHWAYS
# ============================================================

@app.post("/api/pathways")
def generate_pathways(
    profile: dict
):

    print(
        "\n========== PATHWAY REQUEST =========="
    )

    print(
        json.dumps(
            profile,
            indent=2,
            default=str
        )
    )

    system_prompt = """
You are EduPath AI, an education and career
decision-support assistant for Class 10 students
and their parents.

Your task is to generate MULTIPLE possible
education/career pathways.

Do NOT choose one single career for the student.

The response must help the student compare
different routes.

You must return ONLY valid JSON.

Return this exact structure:

{
  "pathways": [
    {
      "id": "unique-id",
      "title": "Pathway title",
      "route": "Step-by-step education route",
      "countries": ["India", "Canada"],
      "durationYears": 4,
      "estimatedCost": "Planning range",
      "admission": [
        "Admission requirement"
      ],
      "careers": [
        "Career 1",
        "Career 2",
        "Career 3"
      ],
      "fit": 75,
      "rationale": [
        "Reason this pathway matches the profile"
      ],
      "assumptions": [
        "Important assumption"
      ],
      "uncertainty": [
        "Important uncertainty"
      ]
    }
  ],

  "matrix": {
    "criteria": [
      "Academic fit",
      "Budget fit",
      "Geographic flexibility",
      "Career breadth"
    ],
    "rows": [
      {
        "pathway": "Pathway title",
        "values": {
          "Academic fit": "80/100",
          "Budget fit": "Moderate",
          "Geographic flexibility": "High",
          "Career breadth": "Broad"
        }
      }
    ]
  },

  "assumptions": [
    "Important planning assumption"
  ]
}

IMPORTANT:

- Generate 4 to 6 different pathways.
- Do not always generate Medicine, Computer Science,
  and Business.
- Use the student's actual interests.
- Consider marks.
- Consider budget.
- Consider preferred countries.
- Consider location preference.
- Consider financial aid.
- Include alternative pathways.
- If the student likes AI, consider AI/CS,
  data science, software engineering,
  cybersecurity, electronics/robotics, etc.
- If the student likes biology, consider medicine,
  biotechnology, pharmacy, public health, etc.
- If the student likes mathematics/physics,
  consider engineering, computer science,
  economics, data science, etc.
- If the student has a constrained budget,
  explicitly discuss lower-cost routes.
- Do not invent exact tuition fees,
  scholarship amounts, admission cutoffs,
  or university-specific requirements.
- Clearly label estimates and assumptions.
- fit must be a number between 0 and 100.
"""


    user_prompt = f"""
Create education and career pathways for this
student profile:

{json.dumps(
    profile,
    indent=2,
    default=str
)}

Return only JSON.
"""


    result = call_groq(
        system_prompt,
        user_prompt
    )


    # Safety normalization
    if not isinstance(
        result.get("pathways"),
        list
    ):
        result["pathways"] = []


    if not isinstance(
        result.get("assumptions"),
        list
    ):
        result["assumptions"] = []


    if not isinstance(
        result.get("matrix"),
        dict
    ):
        result["matrix"] = {
            "criteria": [],
            "rows": [],
        }


    print(
        "\n========== GROQ PATHWAYS GENERATED =========="
    )

    print(
        json.dumps(
            result,
            indent=2,
            default=str
        )
    )

    return result


# ============================================================
# WHAT-IF SCENARIOS
# ============================================================

@app.post("/api/scenarios")
def generate_scenario(
    payload: dict
):

    print(
        "\n========== SCENARIO REQUEST =========="
    )

    profile = payload.get(
        "profile",
        {}
    )

    scenario = payload.get(
        "scenario",
        ""
    )


    if not scenario:
        raise HTTPException(
            status_code=400,
            detail="Scenario is required."
        )


    system_prompt = """
You are EduPath AI.

You are helping a Class 10 student explore
what-if education and career scenarios.

Do NOT make one final decision for the student.

Analyze the scenario and provide alternatives.

Return ONLY valid JSON.

Use this structure:

{
  "scenario": "The scenario",
  "summary": "Short explanation",
  "impact": [
    "What changes"
  ],
  "alternativePathways": [
    {
      "title": "Alternative pathway",
      "route": "Route description",
      "whyItFits": "Why it could fit",
      "durationYears": 4,
      "costConsideration": "Cost consideration",
      "uncertainty": [
        "Uncertainty"
      ]
    }
  ],
  "nextSteps": [
    "Practical next step"
  ],
  "assumptions": [
    "Planning assumption"
  ]
}

Examples of scenarios:

"What if I don't get MBBS?"

"What if my annual budget is reduced by 50%?"

"What if I want to study abroad?"

"What if I cannot clear the entrance exam?"

"What if I choose computer science instead?"

Always provide multiple alternatives.
"""


    user_prompt = f"""
Student profile:

{json.dumps(
    profile,
    indent=2,
    default=str
)}

What-if scenario:

{scenario}

Analyze this scenario and return only JSON.
"""


    result = call_groq(
        system_prompt,
        user_prompt
    )


    print(
        "\n========== GROQ SCENARIO GENERATED =========="
    )

    print(
        json.dumps(
            result,
            indent=2,
            default=str
        )
    )

    return result