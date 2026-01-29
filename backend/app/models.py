from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, index=True)
    date = Column(Date)

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))

    item_name = Column(String)
    quantity = Column(Integer)
    price = Column(Float)

    sale = relationship("Sale", back_populates="items")
