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

To ensure the **Presidential Chatbot** remains mission-critical and reliable, the following test cases verify the **Deterministic Waterfall Logic** (**Time > Numbers > Sentiment**).

1. **High-Urgency Deadlines (Deep Orange)** Inputting tasks like **"Fix the server by 3:00 AM"** triggers a **Deep Orange** bubble. The logic calculates the real-time delta from the current system clock (e.g., 1:35 AM), identifying the urgency as **under 2 hours**.

2. **Long-Term Planning (Royal Blue)** Inputting directives such as **"Complete in 48 hours"** triggers a **Royal Blue** bubble. The regex engine successfully identifies numerical values **over 24 hours**, shifting the UI to a **"long-term planning"** state.

3. **Numerical Power States (Black)** Inputting a **"Power Number"** like **"1100"** or **"100"** triggers a high-contrast **Black** bubble. The modulo math (**absNum % 100 === 0**) ensures that significant data points are visually prioritized over standard text.

4. **Mid-Tier Data Mapping (Grey)** Inputting numbers ending in **50**, such as **"750"**, triggers a **Grey** bubble. This demonstrates the **"Grayscale Logic"** where the UI provides a neutral visual weight to secondary numerical data.

5. **Sentiment Override (Forest Green / Crimson Red)** Inputting purely emotional statements like **"The mission was a success!"** or **"I am worried"** triggers **Green** or **Red**. These only activate if **no deadlines or numbers** are detected, proving the **Priority Waterfall** is functioning correctly.

---
