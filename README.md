# AI-Powered Travel Lead Assistant

A split-panel travel chatbot that detects buying intent, extracts structured lead information in real time, and saves qualified leads to Supabase.

---

## Tech Stack

| Layer    | Choice                         |
|----------|--------------------------------|
| Frontend | React 18 + Vite                |
| Backend  | Node.js + Express              |
| AI       | llama 3.3 70b versatile        |
| Database | Supabase (PostgreSQL)          |

---

## Lead Scoring Logic

### The dual-prompt approach

Every user message triggers **two sequential Gemini calls**:

**Call 1 — Analysis** (`temperature: 0.0`)
Strict extraction. Returns raw JSON with every travel field, a booking score, and decision flags. Low temperature ensures consistent, deterministic output — the same message always produces the same score.

**Call 2 — Reply** (`temperature: 0.7`)
The analysis score and extracted fields are injected as context. Gemini generates a natural, warm reply calibrated to where the user is in their buying journey. Higher temperature makes it sound human.

### Scoring rubric

| Signal | Score range |
|---|---|
| No travel topic at all | 0 |
| Casual browsing, wants free info, mentions booking elsewhere | 1–30 |
| Genuine planning intent — has destination or dates but is still exploring | 31–70 |
| Concrete details (destination + dates + travellers + budget) and/or contact shared | 71–100 |

### Confidence tiers

| Score | Confidence |
|---|---|
| 0–35 | Low |
| 36–70 | Medium |
| 71–100 | High |

### When to ask for contact details

`should_ask_contact` becomes `true` when:
- `booking_score >= 40`
- Name **or** phone is still null

The reply prompt is told to weave the contact ask into the conversation naturally — not as a form question.

### When to save a lead

`should_save_lead` becomes `true` only when all three are true:
1. `booking_score >= 70`
2. `fields.name` is not null
3. `fields.phone` is not null

Supabase uses `upsert` on `conversation_id` so reruns don't create duplicates.

---

## Edge Cases

| Situation | Behaviour |
|---|---|
| Contact shared very early | Fields captured, score stays low, lead not saved until intent is established |
| User declines to share contact | `should_ask_contact` set to false, assistant never asks again |
| Interest drops mid-conversation | Score lowered by analysis model, contact ask suppressed |
| Vague dates ("sometime next year") | Captured verbatim in `travelDate`, not discarded |
| Supabase save fails | Error is logged, conversation continues normally — no 500 to the user |

---

## Setup

### 1. Supabase

Run `schema.sql` in the Supabase SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env
# fill in GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Sample Transcripts

