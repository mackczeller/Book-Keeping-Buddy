cat > ~/Documents/Book-Keeping-Buddy/README.md << 'EOF'
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
- Checks new vendors for W-9s and flags missing ones before you hit the $600 IRS threshold
- Delivers a plain-English end-of-day report every night — approve your books in one click

---

## Core Philosophy

**Suggest and report, never act.**

The agent never touches your books, your money, or your vendors without your say-so. It thinks. You decide.

---

## Key Features

**Daily Report & One-Click Approval**
Every night, BookKeep Buddy delivers a full breakdown of everything that happened in your books — written in plain English, not accounting jargon. Approve all entries with one click or review individually.

**Conversational Chatbot**
Ask your books anything. "What was my food cost last Tuesday?" "Which dish has the lowest margin right now?" "How much did I spend on chicken this month?" Answers in seconds, no spreadsheet needed.

**Labor Alerts**
If labor cost % exceeds your target threshold, the agent flags it immediately with a dashboard alert and — in the live product — sends an SMS to the manager on duty.

**Menu Engineering**
Ingredient costs change weekly. BookKeep Buddy tracks every dish's margin in real time. When egg prices jump 38%, it tells you exactly which dishes are affected and by how much.

**Waste & Theft Detection**
Type a quick count into the chatbot — "I have 5 chicken breasts." The agent compares it to what you should have based on purchases and sales and flags the discrepancy.

**Suggestions Panel**
Every daily report includes a suggestions section — W-9 reminders, margin flags, inventory alerts. Each actionable item has a Yes and a Not Now button. Nothing happens until you say so.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Python + FastAPI |
| AI Brain | Claude API (Anthropic) |
| Database | Supabase |
| Hosting | Vercel (frontend) + Railway (backend) |
| Version Control | GitHub |

---

## Live Demo

**URL:** https://book-keeping-buddy.vercel.app

**Demo credentials:**
- Username: `mesaverde`
- Password: `demo2025`

The demo runs on mock data for Mesa Verde Restaurant. The dataset mirrors the exact structure of real Toast POS and QuickBooks API responses.

---

## How to Run Locally

**Prerequisites**
- Node.js 18+
- Python 3.10+
- An Anthropic API key

**Clone the repo**
```bash
git clone https://github.com/mackczeller/Book-Keeping-Buddy.git
cd Book-Keeping-Buddy
```

**Environment variables**

Create a `.env` file in the `/backend` directory with the following: