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

Conversation 1:

I'm planning my honeymoon to hong kong and taiwan



How exciting, a honeymoon in Hong Kong and Taiwan sounds like a fantastic adventure. To help me
better understand your plans, could you tell me what time of year you're thinking of traveling, or do
you have any specific dates in mind? This will help me provide more tailored suggestions for your
romantic getaway.



december, from christmas for 10 days


December is a great time to visit Hong Kong and Taiwan, with the festive atmosphere and mild
winter weather. For a 10-day honeymoon trip starting from Christmas, I'd recommend exploring
Hong Kong's vibrant markets and trying some delicious street food, before heading to Taiwan to
experience its stunning natural beauty and rich culture. If you'd ever like personalised help from
one of our consultants to make your trip even more special, I'm happy to connect you.


i'd love to focus a lot on the food

Foodies will adore Hong Kong and Taiwan, with their incredible culinary scenes. From trying
traditional Cantonese dim sum in Hong Kong to sampling Taiwan's famous night market eats, such
as beef noodle soup and stinky tofu, you'll have a gastronomic adventure like no other. To make the
most of your food-focused honeymoon, I can suggest some must-try dishes and restaurants, and if
you'd ever like personalised help from one of our consultants, I'm happy to connect you.


Shreyas, 6644553300, do suggest me some food as well


Thanks for sharing that with me, Shreyas. For a food-focused honeymoon in Hong Kong and
Taiwan, I highly recommend trying some iconic dishes like Hong Kong's roast goose, Taiwan's
oyster omelets, and the famous egg tarts in both destinations. You should also visit the Temple
Street Night Market in Hong Kong and the Shilin Night Market in Taipei to indulge in a variety of
street food delights.

Lead JSON:
 RAW ANALYSIS: {
  "has_travel_intent": true,
  "booking_score": 100,
  "confidence": "High",
  "fields": {
    "destination": "Hong Kong and Taiwan",
    "departureCity": null,
    "travelDate": "December, from Christmas for 10 days",
    "duration": "10 days",
    "travellers": "2 (honeymoon)",
    "budget": null,
    "tripType": "honeymoon",
    "specialRequirements": "food-focused",
    "name": "Shreyas",
    "phone": "6644553300",
    "email": null
  },
  "should_ask_contact": false,
  "should_save_lead": true,
  "qualification_reason": "User has provided concrete travel details including destination, travel dates, and contact information, indicating a high intent to book."
}

Conversation 2: 

planning a trip to the USA

The USA is a vast and exciting country to explore, with so many different landscapes and cultures
to discover. To help narrow down the options, can you tell me what time of year you're thinking of
traveling, or if you have any specific dates in mind? This will help me give you more tailored advice
on where to go and what to do. What are your interests - city breaks, national parks, or something
else?


i don't know, suggest me somethign

Let's consider a popular option: a summer trip to the East Coast, visiting iconic cities like New York
City and Boston. If you're looking for something more relaxed, the West Coast has amazing
destinations like California and Oregon, with beautiful beaches and outdoor activities. What type of
vacation are you leaning towards - city exploration, outdoor adventures, or a mix of both?

actually, nevermind, i'm not feeling it now


Sometimes travel plans can feel overwhelming, and it's okay to take a step back. If you ever change
your mind or want to explore other options, I'm here to help with any questions or ideas you might
have about traveling in the USA. Feel free to reach out whenever you're ready to start planning
again.

JSON:
{
  "has_travel_intent": false,
  "booking_score": 10,
  "confidence": "Low",
  "fields": {
    "destination": "USA",
    "departureCity": null,
    "travelDate": null,
    "duration": null,
    "travellers": null,
    "budget": null,
    "tripType": null,
    "specialRequirements": null,
    "name": null,
    "phone": null,
    "email": null
  },
  "should_ask_contact": false,
  "should_save_lead": false,
  "qualification_reason": "User initially showed interest in traveling to the USA but later lost interest and decided not to proceed."
}

