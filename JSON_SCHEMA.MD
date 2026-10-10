# EduPath — Student Profile JSON Schema

## 1. Overview

This schema defines the student profile collected by EduPath.

The current scope is limited to students who are studying in Class 10, have completed Class 10, or are awaiting their Class 10 results.

The profile contains:

- Basic student information
- Academic background and subjects
- Interests and self-reported strengths
- Written description of interests
- Budget and funding preferences
- Study destination and personal priorities
- Career certainty

The `interest_description` field preserves the student's own words and must not be silently rewritten or replaced by AI-generated content.

## 2. Example Student Profile

```json
{
  "education_stage": "class10",
  "preferred_name": "Aarav",
  "country": "India",
  "region": "Maharashtra",
  "curriculum": "State Board",
  "academic_status": "currently_studying",
  "preferred_language": "English",
  "subjects": [
    {
      "name": "Mathematics",
      "marks": 85,
      "maximum_marks": 100,
      "result_status": "completed",
      "favourite": true,
      "challenging": false
    },
    {
      "name": "Science",
      "marks": 91,
      "maximum_marks": 100,
      "result_status": "completed",
      "favourite": true,
      "challenging": false
    },
    {
      "name": "English",
      "marks": null,
      "maximum_marks": 100,
      "result_status": "awaited",
      "favourite": false,
      "challenging": false
    }
  ],
  "overall_percentage": null,
  "overall_result_status": "awaited",
  "interests": [
    "technology_coding",
    "mathematics_logic",
    "science_discovery"
  ],
  "strengths": [
    {
      "name": "logical_problem_solving",
      "rating": 4,
      "rating_status": "rated"
    },
    {
      "name": "creativity",
      "rating": null,
      "rating_status": "not_sure"
    }
  ],
  "interest_description": "I enjoy solving mathematical problems and exploring how technology works. I like experimenting with computers and creating projects that solve real-world problems.",
  "annual_budget": {
    "currency": "INR",
    "amount": 150000,
    "budget_status": "estimated"
  },
  "funding_preferences": {
    "interested_in_scholarships": true,
    "willing_to_consider_loans": false
  },
  "preferred_destination": "india",
  "priorities": [
    "affordability",
    "interest_in_subject",
    "career_opportunities"
  ],
  "career_certainty": "exploring",
  "created_at": "2026-10-10T10:00:00Z",
  "updated_at": "2026-10-10T10:00:00Z"
}
```

The values above are illustrative. Missing marks must be represented by `null`, not zero.

## 3. JSON Schema Definition

The following uses JSON Schema Draft 2020-12.

Save this definition separately as `student-profile.schema.json` if you want to validate student profile objects programmatically.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "EduPath Class 10 Student Profile",
  "description": "Student profile for exploring education options after Class 10.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "education_stage",
    "country",
    "curriculum",
    "academic_status",
    "subjects",
    "interests",
    "strengths",
    "interest_description",
    "annual_budget",
    "funding_preferences",
    "preferred_destination",
    "priorities",
    "career_certainty"
  ],
  "properties": {
    "education_stage": {
      "type": "string",
      "const": "class10",
      "description": "Fixed internally for the current project scope."
    },
    "preferred_name": {
      "type": ["string", "null"],
      "maxLength": 80
    },
    "country": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "region": {
      "type": ["string", "null"],
      "maxLength": 100
    },
    "curriculum": {
      "type": "string",
      "enum": ["CBSE", "ICSE", "State Board", "Other"]
    },
    "academic_status": {
      "type": "string",
      "enum": [
        "currently_studying",
        "completed",
        "awaiting_results"
      ]
    },
    "preferred_language": {
      "type": ["string", "null"],
      "maxLength": 50
    },
    "subjects": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "marks",
          "maximum_marks",
          "result_status",
          "favourite",
          "challenging"
        ],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
          },
          "marks": {
            "type": ["number", "null"],
            "minimum": 0
          },
          "maximum_marks": {
            "type": ["number", "null"],
            "exclusiveMinimum": 0
          },
          "result_status": {
            "type": "string",
            "enum": [
              "completed",
              "predicted",
              "awaited",
              "unavailable"
            ]
          },
          "favourite": {
            "type": "boolean"
          },
          "challenging": {
            "type": "boolean"
          }
        }
      }
    },
    "overall_percentage": {
      "type": ["number", "null"],
      "minimum": 0,
      "maximum": 100
    },
    "overall_result_status": {
      "type": "string",
      "enum": [
        "completed",
        "predicted",
        "awaited",
        "unavailable"
      ]
    },
    "interests": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [
          "technology_coding",
          "mathematics_logic",
          "science_discovery",
          "biology_healthcare",
          "business_finance",
          "creativity_design",
          "social_sciences_communication",
          "environment_sustainability",
          "practical_technical_work",
          "helping_people",
          "sports_physical_activities",
          "exploring_new_ideas",
          "still_exploring"
        ]
      }
    },
    "strengths": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "name",
          "rating",
          "rating_status"
        ],
        "properties": {
          "name": {
            "type": "string",
            "enum": [
              "logical_problem_solving",
              "numerical_reasoning",
              "creativity",
              "communication",
              "teamwork",
              "attention_to_detail",
              "practical_problem_solving",
              "curiosity_independent_learning"
            ]
          },
          "rating": {
            "type": ["integer", "null"],
            "minimum": 1,
            "maximum": 5
          },
          "rating_status": {
            "type": "string",
            "enum": [
              "rated",
              "not_sure"
            ]
          }
        }
      }
    },
    "interest_description": {
      "type": "string",
      "maxLength": 1000,
      "description": "The student's own description of their interests, hobbies, favourite activities and problems they would like to solve."
    },
    "annual_budget": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "currency",
        "amount",
        "budget_status"
      ],
      "properties": {
        "currency": {
          "type": "string",
          "pattern": "^[A-Z]{3}$"
        },
        "amount": {
          "type": ["number", "null"],
          "minimum": 0
        },
        "budget_status": {
          "type": "string",
          "enum": [
            "estimated",
            "fixed",
            "not_sure"
          ]
        }
      }
    },
    "funding_preferences": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "interested_in_scholarships",
        "willing_to_consider_loans"
      ],
      "properties": {
        "interested_in_scholarships": {
          "type": "boolean"
        },
        "willing_to_consider_loans": {
          "type": "boolean"
        }
      }
    },
    "preferred_destination": {
      "type": "string",
      "enum": [
        "india",
        "abroad",
        "both",
        "undecided"
      ]
    },
    "priorities": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [
          "affordability",
          "interest_in_subject",
          "career_opportunities",
          "stability",
          "creativity",
          "flexibility",
          "social_impact"
        ]
      }
    },
    "career_certainty": {
      "type": "string",
      "enum": [
        "specific_career",
        "few_ideas",
        "exploring"
      ]
    },
    "created_at": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "updated_at": {
      "type": ["string", "null"],
      "format": "date-time"
    }
  }
}
```

## 4. Important Validation Rules

Implement these checks in your frontend and backend:

1. `education_stage` must always be `class10`.
2. Subject marks must not exceed maximum marks when both values are available.
3. Missing marks must remain `null`; do not convert them to zero.
4. If a strength rating is `null`, its status should be `not_sure`.
5. If `budget_status` is `not_sure`, `amount` should be `null`.
6. The `interest_description` field must preserve the student's original wording.
7. Interest and priority selections must not contain duplicate values.
8. Marks, percentages, and budget values must be validated before saving.
9. The backend must validate incoming data before saving it.
10. AI-generated suggestions must not be presented as facts about the student.

JSON Schema alone does not enforce every cross-field rule. Implement additional validation in TypeScript or FastAPI for rules 2, 4 and 5.

## 5. Suggested File Structure

```text
project/
├── frontend/
│   └── src/
│       ├── types/
│       │   └── studentProfile.ts
│       ├── services/
│       │   └── profileService.ts
│       └── pages/
│           ├── LandingPage.tsx
│           ├── OnboardingPage.tsx
│           └── FutureProfilePage.tsx
├── backend/
│   ├── schemas/
│   │   └── student_profile.py
│   └── main.py
├── docs/
│   └── JSON_SCHEMA.md
└── student-profile.schema.json
```

Use `JSON_SCHEMA.md` for documentation, `student-profile.schema.json` for machine-readable JSON Schema validation, and TypeScript interfaces or Pydantic models for application-level validation.

---

## 6. Authentication and Account Schema

EduPath includes Sign In and Register screens. Account data must remain separate from the Class 10 student profile defined above.

**Important:** Adding frontend screens does not automatically implement authentication in FastAPI. The routes below are a proposed API contract only. Check the existing backend and `/docs` before connecting the frontend.

### 6.1 Register Request

Proposed endpoint: `POST /api/auth/register`

Example request:

```json
{
  "preferred_name": "Aarav",
  "email": "aarav@example.com",
  "password": "a-strong-password"
}
```

Validation requirements:

- `preferred_name`: required, trimmed string, 1–80 characters.
- `email`: valid email address, normalized consistently, unique in the database.
- `password`: required and validated by the backend against the password policy.
- Do not accept client-supplied `user_id`, `role`, `is_admin`, `password_hash`, or authentication tokens.
- Hash passwords using a recognised password-hashing algorithm.
- Never store plaintext passwords.

### 6.2 Sign In Request

Proposed endpoint: `POST /api/auth/login`

Example request:

```json
{
  "email": "aarav@example.com",
  "password": "a-strong-password"
}
```

Requirements:

- Validate the email format and require a non-empty password.
- Return a generic authentication error for invalid credentials.
- Use HTTPS in production.
- Use the session or token mechanism implemented by the backend.
- Do not store passwords or sensitive bearer tokens in `localStorage`.

### 6.3 Safe Account Response

A successful authentication response should contain only public account information.

Example:

```json
{
  "user": {
    "id": 42,
    "preferred_name": "Aarav",
    "email": "aarav@example.com"
  }
}
```

This is illustrative. Adapt it to the actual backend implementation.

Never return a password, password hash, session secret, or other private credential.

For browser-based sessions, prefer secure HttpOnly cookies when supported by the application architecture. Configure cookie security, expiration, SameSite and CSRF protections appropriately.

### 6.4 Proposed Authentication Endpoints

| Purpose | Method | Proposed endpoint |
|---|---|---|
| Register | POST | `/api/auth/register` |
| Sign in | POST | `/api/auth/login` |
| Current account | GET | `/api/auth/me` |
| Sign out | POST | `/api/auth/logout` |

These endpoints are suggestions, not confirmation that the backend already supports them. Inspect the FastAPI application and its `/docs` page before using these paths.

If authentication is not implemented, implement it securely in the backend before claiming that Sign In and Register work. Do not simulate authentication using a local-storage flag or fake success message.

---

## 7. Relationship Between Accounts and Student Profiles

- Registration creates an account; it does not mean the student profile is complete.
- The student profile remains the object defined in Sections 1–5.
- Do not put passwords, password hashes, access tokens, refresh tokens, or session secrets into a student profile.
- Do not add account fields to profile requests unless the actual backend schema requires them.
- Associate each profile with the authenticated account on the server.
- Do not trust a user ID supplied by the browser to establish profile ownership.
- A student must not be able to read, update, or delete another student's profile by changing `profile_id`.
- Restrict `GET /api/profiles` to authorised administrators or remove public listing if it is not required.
- Preserve the existing `/api/pathways` and `/api/scenarios` endpoints when adding authentication.

## 8. Frontend Environment Configuration

The frontend API base URL is configured using `VITE_API_BASE`.

### Local Development

```env
VITE_API_BASE=http://localhost:8000
```

### Production

```env
VITE_API_BASE=https://edupath-ai-backend-9van.onrender.com
```

Vite variables prefixed with `VITE_` are visible in the browser bundle. Only put non-secret configuration, such as the API base URL, in these variables.

Never put API keys, database credentials, passwords, or other secrets in frontend environment variables.

Keep real `.env` and `.env.local` files out of Git. Commit only safe example templates with placeholder values.

## 9. Authentication and Profile Validation Checklist

- [ ] Sign In and Register forms validate fields and show useful errors.
- [ ] Authentication forms call real backend endpoints before showing success.
- [ ] The backend hashes passwords and enforces unique email addresses.
- [ ] No password or password hash is returned by the API.
- [ ] Authentication failures do not disclose whether an email exists.
- [ ] No fake login state is created using `localStorage`.
- [ ] Student profile JSON remains separate from account credentials.
- [ ] Profile endpoints enforce authentication and ownership where required.
- [ ] Profile validation rules in Section 4 remain in force.
- [ ] `GET /health`, `/api/profiles`, `/api/pathways` and `/api/scenarios` are checked against the running backend before frontend integration.
- [ ] New authentication routes are documented in the backend API documentation.
- [ ] The frontend build succeeds.
- [ ] Real `.env` files and secrets are not committed to Git.
