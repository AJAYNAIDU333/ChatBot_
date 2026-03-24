# 🏛️ Petasight Diplomatic Portal

A highly opinionated, full-stack conversational interface built with a **Deterministic Logic Waterfall**. The application adopts the persona of a foreign political leader, providing authoritative responses in their native script alongside English translations, while strictly enforcing WCAG 2.0 AA accessibility standards.

## 🚀 Live Deployment
**[Experience the Live Portal](https://petasight-diplomatic-portal.vercel.app/)**

## 🧠 Core Architecture: The Logic Waterfall
To ensure 100% reliability and reduce unnecessary LLM API costs, this application utilizes a cascading logic engine that processes user input through three distinct tiers:

### Tier 1: Temporal Urgency (The Deadline Engine)
The system parses input for time-based keywords and deadlines using Regex. It calculates the delta from the current system clock to determine urgency:
* **Deep Orange (#ff4d00):** Deadline is < 2 hours.
* **Yellow:** Deadline is < 24 hours.
* **Royal Blue:** Deadline is >= 24 hours.

### Tier 2: Numerical Modulo (The Grayscale Engine)
If no temporal trigger is detected, the engine analyzes free-form integers using a Modulo 100 (`% 100`) calculation to assign visual weight:
* **Black:** Power Numbers (Multiples of 100).
* **Grey:** Mid-point numbers (Ending in 50).
* **White:** Base numbers (Ending in 00).

### Tier 3: Sentiment Fallback (AI Integration)
If the input contains no specific time or numerical data, the payload is sent to **Gemini 1.5 Flash**. The LLM performs a sentiment analysis to return a specific color state:
* **Green:** Positive/Very Happy.
* **Amber:** Neutral/Diplomatic.
* **Red:** Negative/Very Sad.

## ♿ WCAG 2.0 AA Compliance (Luminosity Mapping)
The UI features a dynamic contrast engine. It calculates the relative luminosity of the background color and automatically toggles the text color (White vs. Dark-Neutral) to maintain a **minimum 4.5:1 contrast ratio**. The application is fully keyboard-navigable (`Tab` / `Enter`).

## 🔐 Security & Guardrails
* **Domain Lock:** Authentication is strictly restricted to `@petasight.com` email addresses.
* **Server-Side Verification:** Access is enforced via server-side JWT validation to prevent unauthorized entry.
* **Environment Security:** All API keys and secrets are managed via Vercel and excluded from version control for maximum security.

## 🛠️ Tech Stack
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS + shadcn/ui
* **Auth/Backend:** Supabase Edge Functions
* **AI Model:** Google Gemini 1.5 Flash API
* **Deployment:** Vercel

---

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/AJAYNAIDU333/ChatBot_.git](https://github.com/AJAYNAIDU333/ChatBot_.git)
