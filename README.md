# BookKeep Buddy

An AI bookkeeping agent built for independent restaurants. BookKeep Buddy connects Toast POS and QuickBooks to automate the daily financial work that takes restaurant owners hours every week — and delivers it back as a plain-English report with one-click approval every night.

No accounting degree required. No more digging through QuickBooks. Just a clean daily summary, actionable suggestions, and you stay in control.

---

## The Problem

Running a restaurant is hard enough. Bookkeeping on top of it — tracking food costs, reconciling tips, chasing vendor invoices, watching labor eat into your margins — costs owners 5-10 hours every week. Hiring an accountant is expensive. QuickBooks is powerful but confusing. Toast tracks your sales but doesn't talk to your books.

BookKeep Buddy sits in the middle and does the work for you.

---

## What It Does

- Pulls daily sales, labor, and tip data from Toast POS every 30 minutes
- Automatically categorizes transactions into the correct restaurant accounts
- Tracks food cost % in real time and alerts you when margins drift
- Watches your menu — if ingredient costs rise, it tells you exactly which dishes are losing money and by how much
- Calculates theoretical inventory from invoices and sales, then flags waste or theft discrepancies
- Reconciles tips across Toast, your card processor, and payroll — with a 48-hour settlement window so you never get false alarms
- Calculates nightly tip outs for bussers, food runners, and support staff automatically
- Checks new vendors for W-9s and flags missing ones before you hit the $600 IRS threshold
- Delivers a plain-English end-of-day report every night — approve your books in one click

---

## Core Philosophy

**Suggest and report, never act.**

The agent never touches your books, your money, or your vendors without your say-so. It thinks. You decide.

---

## Key Features

**Daily Report & One-Click Approval**
Every night at a time you choose, BookKeep Buddy delivers a full breakdown of everything that happened in your books that day — written in plain English, not accounting jargon. Approve all entries with one click or review individually.

**Conversational Chatbot**
Ask your books anything. "What was my food cost last Tuesday?" "Which dish has the lowest margin right now?" "How much did I spend on chicken this month?" Answers in seconds, no spreadsheet needed.

**Labor Alerts**
If sales drop below your threshold but you still have a full floor, the agent pings you: "Labor is at 45% for the last 60 minutes. Suggest cutting 2 servers to save ~$85 tonight. Your call."

**Menu Engineering**
Ingredient costs change weekly. BookKeep Buddy tracks every dish's margin in real time. When egg prices jump 20%, it tells you exactly which dishes are affected and what to reprice.

**Waste & Theft Detection**
Type a quick count into the chatbot — "I have 5 chicken breasts." The agent compares it to what you should have based on purchases and sales: "Theoretical count is 20. You are missing 15 pieces (~$45 at cost). Flag for review?"

**Suggestions Panel**
Every daily report includes a suggestions section — W-9 reminders, margin flags, labor recommendations, inventory alerts. Each one has a Yes and a Not Now button. Nothing happens until you say so.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Python + FastAPI |
| AI Brain | Claude API (Anthropic) |
| Database | Supabase |
| Primary Ledger | QuickBooks Online |
| Revenue Data | Toast POS |
| Bank Sync | Plaid |
| Hosting | Vercel (frontend) + Railway (backend) |
| Version Control | GitHub |

---

## How to Run It Locally

**Prerequisites**
- Node.js installed
- Python 3.x installed
- A Supabase account
- An Anthropic API key

**Clone the repo**
```bash
git clone https://github.com/yourusername/bookkeep-buddy.git
cd bookkeep-buddy
```

**Set up the backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Anthropic API key and Supabase credentials to .env
python main.py
```

**Set up the frontend**
```bash
cd frontend
npm install
npm run dev
```

**Open your browser**
http://localhost:3000

---

## Demo

The current version runs on mock data for a fictional restaurant called Mesa Verde. The mock dataset mirrors the exact structure of real Toast POS and QuickBooks API responses — making the transition to live API integration straightforward post-demo.

---

## Roadmap

**Demo — June 13**
- AI chatbot answering real restaurant questions
- Daily report with one-click approval
- Suggestions panel
- Labor alert notifications
- Menu margin tracker
- Waste and theft detection
- W-9 compliance flagging

**Post-Contest**
- Live Toast API integration
- Live QuickBooks Online API integration
- Plaid bank sync
- Full payroll automation with tip out calculations
- W-9 outreach emails
- 1099 year-end export
- Multi-location support

---

CUA AI Contest — June 2026
SIC 5812 — Eating Places
