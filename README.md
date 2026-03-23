# 🇷🇺 Presidential Chatbot (Russian Edition)

A high-performance, accessible React application featuring an authoritative Russian President persona. This project implements a deterministic **Color Priority Waterfall** and strict domain-based authentication.

## 🚀 Live Demo
**Vercel Link:** [https://chatbot-eight-xi-78.vercel.app/](https://chatbot-eight-xi-78.vercel.app/)

---

## 🛠️ The Tech Stack
* **Frontend:** React (Vite) + TypeScript
* **Styling:** Tailwind CSS (WCAG 2.0 AA Compliant)
* **AI Engine:** Google Gemini 1.5 Flash (via GCP Project `chatbot-491119`)
* **Infrastructure:** Vercel (CI/CD via GitHub)
* **Security:** Vercel Secret Management for Environment Variables

---

## 🧠 SDE Thinking Process: The Logic Waterfall

The application uses a **Deterministic Logic Engine** in `colorLogic.ts` to calculate message bubble colors locally. This ensures 100% predictable UI behavior and immediate feedback, even if the network is latent.

### **Priority 1: Temporal Urgency (Deadlines)**
The highest priority. The system calculates a `Time Delta` between the current system clock and the user's input.
* **Deep Orange (`#C2410C`):** High Urgency (Deadline < 2 hours).
* **Yellow (`#FACC15`):** Near-term (Deadline 2h - 24h).
* **Royal Blue (`#1D4ED8`):** Long-term (Deadline > 24 hours).

### **Priority 2: Numerical Data (Grayscale)**
Triggers only if no deadline is detected. Uses modulo math (`% 100`) to map data importance.
* **Black:** "Power Numbers" (e.g., **100**, **1100**, or any number ending in **99**).
* **Grey:** Mid-point data (e.g., **750**, **50**).
* **White:** Neutral data or Zero.

### **Priority 3: Emotional Sentiment (AI Fallback)**
Triggers only if no deadline or number is found. The Gemini model identifies the tone.
* **Forest Green:** Positive/Success.
* **Crimson Red:** Negative/Critical.
* **Amber:** Neutral/Diplomatic.

---

## ♿ Accessibility & WCAG 2.0 Compliance
* **Contrast Ratio:** Every bubble state is audited for a **4.5:1 minimum contrast ratio**.
* **Luminosity-Aware Pairing:** The system dynamically switches between `text-white` (on dark backgrounds like Blue/Orange) and `text-black` (on light backgrounds like Yellow/White).
* **Focus Management:** Implemented full keyboard navigation support for screen readers.

---

## 🧪 Verified Test Suite
To verify the logic, use these inputs (relative to current system time):
1. **Urgency:** "Fix the server by 3:30 AM" → **Deep Orange** (If current time is ~1:30 AM).
2. **Logic Override:** "I am happy about the **1100** reports." → **Black** (Priority 2 Number beats Priority 3 Sentiment).
3. **Conflict Resolution:** "Submit **100** tasks by **2:00 PM**." → **Yellow** (Priority 1 Deadline beats Priority 2 Number).
4. **Resilience:** If the Gemini API credits are exhausted, the bubble still correctly colors locally based on the deterministic waterfall.

---
