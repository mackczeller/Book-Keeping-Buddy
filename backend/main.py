from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Load mock data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, "toast_sales.json")) as f:
    toast_sales = json.load(f)
with open(os.path.join(BASE_DIR, "vendor_invoices.json")) as f:
    vendor_invoices = json.load(f)
with open(os.path.join(BASE_DIR, "inventory_counts.json")) as f:
    inventory_counts = json.load(f)
with open(os.path.join(BASE_DIR, "toast_labor.json")) as f:
    toast_labor = json.load(f)
with open(os.path.join(BASE_DIR, "quickbooks_chart_of_accounts.json")) as f:
    quickbooks_data = json.load(f)

SYSTEM_PROMPT = """You are BookKeep Buddy, an AI bookkeeping agent for Mesa Verde Restaurant.
You have access to their Toast POS sales data, vendor invoices, inventory counts, and labor data.
Answer questions in plain English like a knowledgeable friend, not an accountant.
Be concise and specific. Always reference actual numbers from the data when answering.
The restaurant owner is not an accountant — keep it simple and actionable.

MENU ITEM COST DATA:
- Breakfast Burrito: menu price $12.00, food cost before egg spike $3.60 (30% margin), after 38% egg price increase food cost is now $4.97 (margin dropped from 30% to 18.6%). Recommend raising price to $13.50 to restore 26% margin.
- Tacos al Pastor: menu price $14.00, food cost $4.20, margin 30%
- Enchiladas Verdes: menu price $13.00, food cost $3.90, margin 30%
- Carne Asada Plate: menu price $18.00, food cost $6.30, margin 35%
- Chicken Quesadilla: menu price $11.00, food cost $3.30, margin 30%"""

class ChatMessage(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "BookKeep Buddy is running"}

@app.post("/chat")
def chat(body: ChatMessage):
    context = f"""
    MESA VERDE RESTAURANT DATA:
    Monthly Sales Summary: {json.dumps(toast_sales['monthly_summary'])}
    Vendor Invoices Summary: {json.dumps(vendor_invoices['summary'])}
    Inventory Summary: {json.dumps(inventory_counts['summary'])}
    Labor Summary: {json.dumps(toast_labor['monthly_summary'])}
    """
    
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT + context,
        messages=[{"role": "user", "content": body.message}]
    )
    
    return {"response": response.content[0].text}

@app.post("/report")
def generate_report(date: str = "2024-05-10"):
    
    report_prompt = f"""
    Generate a plain-English end-of-day bookkeeping report for Mesa Verde Restaurant.
    
    Write it like a smart, friendly bookkeeper leaving the owner a note at the end of their shift.
    No jargon. Be specific with numbers. Keep it scannable.
    
    Structure it exactly like this:
    
    1. DAILY SUMMARY — revenue, covers, average check, how it compares to normal
    2. FOOD COST — what % and whether it's in range (target is under 32%)
    3. LABOR COST — what % and whether it's in range (target is under 30%)
    4. FLAGS & ALERTS — anything unusual: duplicates, inventory gaps, compliance issues
    5. SUGGESTIONS — 2-3 specific actionable items the owner should consider, each as a yes/no decision
    
    DATA FOR {date}:
    Sales: {json.dumps(toast_sales['monthly_summary'])}
    Labor: {json.dumps(toast_labor['monthly_summary'])}
    Invoices: {json.dumps(vendor_invoices['summary'])}
    Inventory: {json.dumps(inventory_counts['summary'])}
    QuickBooks: {json.dumps(quickbooks_data)}
    """
    
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system="You are BookKeep Buddy, an AI bookkeeper for Mesa Verde Restaurant. Write clear, specific, plain-English reports for a restaurant owner who is not an accountant.",
        messages=[{"role": "user", "content": report_prompt}]
    )
    
    return {"report": response.content[0].text, "date": date}