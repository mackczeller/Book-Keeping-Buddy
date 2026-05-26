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

SYSTEM_PROMPT = """You are BookKeep Buddy, an AI bookkeeping agent for Mesa Verde Restaurant.
You have access to their Toast POS sales data, vendor invoices, inventory counts, and labor data.
Answer questions in plain English like a knowledgeable friend, not an accountant.
Be concise and specific. Always reference actual numbers from the data when answering.
The restaurant owner is not an accountant — keep it simple and actionable."""

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
