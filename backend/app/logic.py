from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta

from app.models import Sale, SaleItem
from app.schemas import DailySalesCreate


# ---------- CREATE DAILY SALES ----------

def process_daily_sales(db: Session, data: DailySalesCreate):
    sale = Sale(
        store_name=data.store_name,
        date=data.date
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)

    for item in data.items:
        sale_item = SaleItem(
            sale_id=sale.id,
            item_name=item.item_name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(sale_item)

    db.commit()
    return {"message": "Sales saved successfully"}


# ---------- UPDATE SALE ----------

def update_sale(db: Session, sale_id: int, data: DailySalesCreate):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return None

    sale.store_name = data.store_name
    sale.date = data.date

    db.query(SaleItem).filter(SaleItem.sale_id == sale_id).delete()

    for item in data.items:
        db.add(SaleItem(
            sale_id=sale_id,
            item_name=item.item_name,
            quantity=item.quantity,
            price=item.price
        ))

    db.commit()
    return {"message": "Sale updated successfully"}


# ---------- DELETE SALE ----------

def delete_sale(db: Session, sale_id: int):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return None

    db.delete(sale)
    db.commit()
    return {"message": "Sale deleted successfully"}


# ---------- DAILY SUMMARY ----------

def get_daily_summary(db: Session, date: date):
    result = db.query(
        func.count(Sale.id),
        func.sum(SaleItem.quantity),
        func.sum(SaleItem.quantity * SaleItem.price)
    ).join(SaleItem).filter(Sale.date == date).first()

    return {
        "date": date,
        "total_sales": result[0] or 0,
        "total_items": result[1] or 0,
        "total_revenue": float(result[2] or 0)
    }


# ---------- MONTHLY SUMMARY ----------

def get_monthly_summary(db: Session, year: int, month: int):
    start = date(year, month, 1)
    end = (start.replace(day=28) + timedelta(days=4)).replace(day=1)

    result = db.query(
        func.sum(SaleItem.quantity),
        func.sum(SaleItem.quantity * SaleItem.price)
    ).join(Sale).filter(
        Sale.date >= start,
        Sale.date < end
    ).first()

    return {
        "year": year,
        "month": month,
        "total_items": result[0] or 0,
        "total_revenue": float(result[1] or 0)
    }


# ---------- STORE SUMMARY ----------

def get_store_summary(db: Session):
    rows = db.query(
        Sale.store_name,
        func.count(Sale.id),
        func.sum(SaleItem.quantity),
        func.sum(SaleItem.quantity * SaleItem.price)
    ).join(SaleItem).group_by(Sale.store_name).all()

    return [
        {
            "store_name": r[0],
            "total_sales": r[1],
            "total_items": r[2] or 0,
            "total_revenue": float(r[3] or 0)
        }
        for r in rows
    ]


# ---------- SALES INSIGHTS ----------

def get_sales_insights(db: Session):
    top_store = db.query(
        Sale.store_name,
        func.sum(SaleItem.quantity * SaleItem.price)
    ).join(SaleItem).group_by(Sale.store_name).order_by(
        func.sum(SaleItem.quantity * SaleItem.price).desc()
    ).first()

    return {
        "top_store": top_store[0] if top_store else None,
        "revenue": float(top_store[1]) if top_store else 0
    }


# ---------- REVENUE TREND ----------

def get_revenue_trend(db: Session, days: int):
    start = date.today() - timedelta(days=days)

    rows = db.query(
        Sale.date,
        func.sum(SaleItem.quantity * SaleItem.price)
    ).join(SaleItem).filter(
        Sale.date >= start
    ).group_by(Sale.date).order_by(Sale.date).all()

    return [
        {"date": r[0], "revenue": float(r[1] or 0)}
        for r in rows
    ]


# ---------- SALES HISTORY ----------

def get_sales_history_by_store(db: Session, store_name: str):
    sales = db.query(Sale).filter(
        Sale.store_name == store_name
    ).order_by(Sale.date.desc()).all()

    return sales


# ---------- SALE BY ID ----------

def get_sale_by_id(db: Session, sale_id: int):
    return db.query(Sale).filter(Sale.id == sale_id).first()
