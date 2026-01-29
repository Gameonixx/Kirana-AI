from typing import List
from datetime import date
from pydantic import BaseModel


# ---------- REQUEST SCHEMAS ----------

class SaleItemCreate(BaseModel):
    item_name: str
    quantity: int
    price: float


class DailySalesCreate(BaseModel):
    store_name: str
    date: date
    items: List[SaleItemCreate]


# ---------- RESPONSE SCHEMAS ----------

class SaleItemResponse(BaseModel):
    item_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    store_name: str
    date: date
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True


class DailySummaryResponse(BaseModel):
    date: date
    total_sales: int
    total_items: int
    total_revenue: float


class StoreSummaryResponse(BaseModel):
    store_name: str
    total_sales: int
    total_items: int
    total_revenue: float
