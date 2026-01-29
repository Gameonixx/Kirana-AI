from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.schemas import DailySalesCreate
from app.logic import (
    process_daily_sales,
    update_sale,
    delete_sale,
    get_daily_summary,
    get_monthly_summary,
    get_store_summary,
    get_sales_insights,
    get_revenue_trend,
    get_sales_history_by_store,
    get_sale_by_id
)

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/sales")
def create_sale(data: DailySalesCreate, db: Session = Depends(get_db)):
    return process_daily_sales(db, data)


@router.put("/sales/{sale_id}")
def edit_sale(sale_id: int, data: DailySalesCreate, db: Session = Depends(get_db)):
    result = update_sale(db, sale_id, data)
    if not result:
        return {"error": "Sale not found"}
    return result


@router.delete("/sales/{sale_id}")
def remove_sale(sale_id: int, db: Session = Depends(get_db)):
    result = delete_sale(db, sale_id)
    if not result:
        return {"error": "Sale not found"}
    return result


@router.get("/sales/summary")
def daily_summary(date: date, db: Session = Depends(get_db)):
    return get_daily_summary(db, date)


@router.get("/sales/monthly-summary")
def monthly_summary(year: int, month: int, db: Session = Depends(get_db)):
    return get_monthly_summary(db, year, month)


@router.get("/sales/store-summary")
def store_summary(db: Session = Depends(get_db)):
    return get_store_summary(db)


@router.get("/sales/insights")
def insights(db: Session = Depends(get_db)):
    return get_sales_insights(db)


@router.get("/sales/trends")
def trends(days: int = 7, db: Session = Depends(get_db)):
    return get_revenue_trend(db, days)


@router.get("/sales/history")
def history(store_name: str, db: Session = Depends(get_db)):
    return get_sales_history_by_store(db, store_name)


@router.get("/sales/{sale_id}")
def sale_by_id(sale_id: int, db: Session = Depends(get_db)):
    sale = get_sale_by_id(db, sale_id)
    if not sale:
        return {"error": "Sale not found"}
    return sale
