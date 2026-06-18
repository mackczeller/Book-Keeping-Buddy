from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()

SALES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "toast_sales.json")

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
Always respond in a formal, professional tone. Structure every response with a one sentence summary at the top, followed by bullet points breaking down the key findings, and end with a brief recommendation or next step. Never respond in a casual conversational paragraph. Always use bullet points for data findings.
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

class MetricsRequest(BaseModel):
    date: str

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
def generate_report(date: str = "2025-05-10"):
    daily_sales_data = next(
        (day for day in toast_sales["daily_sales"] if day["date"] == date),
        None
    )

    if not daily_sales_data:
        return {"error": f"No sales data found for {date}", "date": date}

    daily_shifts = [s for s in toast_labor["shifts"] if s["date"] == date]

    total_wage_cost = sum(s["wage_cost"] for s in daily_shifts)
    total_tips = sum(s["tips"] for s in daily_shifts)
    num_staff = len(daily_shifts)

    daily_labor_summary = {
        "date": date,
        "num_staff": num_staff,
        "total_wage_cost": total_wage_cost,
        "total_tips": total_tips,
        "shifts": daily_shifts
    }

    report_prompt = f"""
    Generate a professional plain-English end-of-day bookkeeping report for Mesa Verde Restaurant.

    Write it like a smart, professional bookkeeper leaving the owner a clear summary at the end of their shift.
    No jargon. Be specific with numbers. Keep it scannable with clear sections.
    Do NOT include any suggestions, yes/no prompts, or action items — those are handled separately.
    Do NOT ask the owner to do anything. Just report the facts clearly and professionally.

    Structure it exactly like this:
    1. DAILY SUMMARY — revenue, covers, average check, how it compares to the monthly average of $2,546/day
    2. FOOD COST — what % and whether it is in range (target is under 32%)
    3. LABOR COST — what % and whether it is in range (target is under 30%). Calculate labor % as wage cost divided by net revenue.
    4. FLAGS & ALERTS — anything unusual: duplicates, inventory gaps, compliance issues. State the facts only, no recommendations.

    DATA FOR {date}:
    Daily Sales: {json.dumps(daily_sales_data)}
    Daily Labor: {json.dumps(daily_labor_summary)}
    Menu Items: {json.dumps(toast_sales['menu_items'])}
    Invoices: {json.dumps(vendor_invoices['summary'])}
    Inventory: {json.dumps(inventory_counts['summary'])}
    """

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system="You are BookKeep Buddy, an AI bookkeeper for Mesa Verde Restaurant. Write clear, specific, professional daily reports for a restaurant owner. Report facts only — no suggestions, no yes/no prompts, no action items.",
        messages=[{"role": "user", "content": report_prompt}]
    )

    return {"report": response.content[0].text, "date": date}


@app.post("/metrics")
def get_metrics(body: MetricsRequest):
    date = body.date

    daily_sales_data = next(
        (day for day in toast_sales["daily_sales"] if day["date"] == date),
        None
    )

    if not daily_sales_data:
        return {"error": f"No sales data found for {date}"}

    revenue = daily_sales_data.get("net_revenue", 0)
    covers  = daily_sales_data.get("covers", 0)
    avg_check = round(revenue / covers, 2) if covers > 0 else 0

    daily_shifts = [s for s in toast_labor["shifts"] if s["date"] == date]
    labor_cost   = sum(s["wage_cost"] for s in daily_shifts)
    labor_pct    = round((labor_cost / revenue * 100), 1) if revenue > 0 else 0

    food_cost = daily_sales_data.get("food_cost_actual", 0)
    
    food_pct  = round((food_cost / revenue * 100), 1) if revenue > 0 else 0

    net_profit     = revenue - food_cost - labor_cost
    net_margin_pct = round((net_profit / revenue * 100), 1) if revenue > 0 else 0

    all_days = toast_sales.get("daily_sales", [])
    cash_position = sum(
        d.get("net_revenue", 0)
        for d in all_days
        if d.get("date", "") <= date
    )

    return {
        "date": date,
        "covers": covers,
        "avg_check": avg_check,
        "metrics": {
            "revenue": {
                "label": "Daily Revenue",
                "value": revenue,
                "format": "currency",
                "status": "ok",
            },
            "food_cost_pct": {
                "label": "Food Cost %",
                "value": food_pct,
                "format": "percent",
                "target": 32.0,
                "status": "ok" if food_pct <= 32 else "warning",
            },
            "labor_cost_pct": {
                "label": "Labor Cost %",
                "value": labor_pct,
                "format": "percent",
                "target": 30.0,
                "status": "ok" if labor_pct <= 30 else "warning",
            },
            "net_margin_pct": {
                "label": "Net Margin",
                "value": net_margin_pct,
                "format": "percent",
                "status": "ok" if net_margin_pct >= 10 else "warning",
            },
            "cash_position": {
                "label": "Cash Position",
                "value": cash_position,
                "format": "currency",
                "status": "ok" if cash_position >= 0 else "warning",
            },
        },
        "covers": covers,
        "avg_check": avg_check,
    }


@app.get("/compare")
async def compare_day(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """
    For a given date, returns that day's metrics vs the average
    of all same-day-of-week entries in the dataset.
    """
    try:
        with open(SALES_FILE) as f:
            data = json.load(f)

        daily_sales = data.get("daily_sales", [])

        # Find the target day
        target = next((d for d in daily_sales if d["date"] == date), None)
        if not target:
            raise HTTPException(status_code=404, detail=f"No data found for date {date}")

        target_dow = target["day_of_week"]

        # All days with the same day-of-week (excluding the target day itself)
        same_dow = [d for d in daily_sales if d["day_of_week"] == target_dow and d["date"] != date]

        if not same_dow:
            raise HTTPException(status_code=404, detail=f"Not enough data to compare for {target_dow}")

        def avg(field):
            return round(sum(d[field] for d in same_dow) / len(same_dow), 2)

        def pct_delta(current, baseline):
            if baseline == 0:
                return 0
            return round(((current - baseline) / baseline) * 100, 1)

        avg_revenue = avg("net_revenue")
        avg_covers = avg("covers")
        avg_food_cost_pct = avg("food_cost_pct")
        avg_labor_pct = avg("labor_pct")

        return {
            "date": date,
            "day_of_week": target_dow,
            "weeks_compared": len(same_dow),
            "today": {
                "net_revenue": target["net_revenue"],
                "covers": target["covers"],
                "food_cost_pct": target["food_cost_pct"],
                "labor_pct": target["labor_pct"],
                "tips_collected": target["tips_collected"],
            },
            "dow_average": {
                "net_revenue": avg_revenue,
                "covers": avg_covers,
                "food_cost_pct": avg_food_cost_pct,
                "labor_pct": avg_labor_pct,
            },
            "deltas": {
                "net_revenue": pct_delta(target["net_revenue"], avg_revenue),
                "covers": pct_delta(target["covers"], avg_covers),
                "food_cost_pct": pct_delta(target["food_cost_pct"], avg_food_cost_pct),
                "labor_pct": pct_delta(target["labor_pct"], avg_labor_pct),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
