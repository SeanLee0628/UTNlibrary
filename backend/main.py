from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prisma import Prisma
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import qrcode
import base64
from io import BytesIO
from datetime import datetime, timedelta

# Database Client
db = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    try:
        # Create standard tables if not exist (Prisma push usually handles this, but we'll assume migration runs)
        yield
    finally:
        await db.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class BookCreate(BaseModel):
    title: str
    author: str

class MemberCreate(BaseModel):
    name: str

class LoanRequest(BaseModel):
    qrData: str
    memberId: int

class ReturnRequest(BaseModel):
    qrData: str

# Helpers
def generate_qr(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

# Routes
@app.get("/")
def read_root():
    return {"message": "Library Management System API"}

@app.post("/books")
async def create_book(book: BookCreate):
    # Determine QR Data (simple unique ID based on timestamp or UUID)
    import uuid
    qr_data = str(uuid.uuid4())
    
    new_book = await db.book.create(data={
        "title": book.title,
        "author": book.author,
        "qrData": qr_data,
        "status": "AVAILABLE"
    })
    
    qr_image = generate_qr(qr_data)
    
    return {
        "book": new_book,
        "qrImage": qr_image
    }

@app.get("/books")
async def get_books():
    return await db.book.find_many(include={"loans": True})

@app.post("/members")
async def create_member(member: MemberCreate):
    return await db.member.create(data={"name": member.name})

@app.get("/members")
async def get_members():
    return await db.member.find_many(include={"loans": True})

@app.post("/checkout")
async def checkout_book(request: LoanRequest):
    book = await db.book.find_unique(where={"qrData": request.qrData})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.status != "AVAILABLE":
        raise HTTPException(status_code=400, detail="Book is not available")
    
    # Create loan
    due_date = datetime.now() + timedelta(days=14)
    loan = await db.loan.create(data={
        "bookId": book.id,
        "memberId": request.memberId,
        "dueDate": due_date
    })
    
    # Update book status
    await db.book.update(where={"id": book.id}, data={"status": "LOANED"})
    
    return {"message": "Checkout successful", "loan": loan}

@app.post("/return")
async def return_book(request: ReturnRequest):
    book = await db.book.find_unique(where={"qrData": request.qrData})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.status == "AVAILABLE":
         raise HTTPException(status_code=400, detail="Book is already returned")

    # Find active loan
    # Note: Prisma queries might need careful filtering for active loans
    # We find the last loan for this book that has no returnDate
    loan = await db.loan.find_first(
        where={
            "bookId": book.id,
            "returnDate": None
        }
    )
    
    if loan:
        await db.loan.update(where={"id": loan.id}, data={"returnDate": datetime.now()})
    
    await db.book.update(where={"id": book.id}, data={"status": "AVAILABLE"})
    
    return {"message": "Return successful"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
