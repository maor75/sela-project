from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from config import DB_CONFIG
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# MongoDB connection details

client = MongoClient(f"mongodb://{DB_CONFIG['username']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}")
db = client.companies
costumer1 = db.costumer
product1 = db.product


# Pydantic models
class Costumer(BaseModel):
    name: str
    mail: str
    phone: str

class Product(BaseModel):
    id: str
    name: str
    provider: str


@app.get("/costumers")
def get_customers():
    customers = costumer1.find()
    if customers:
        # Convert ObjectId to string for JSON serialization
        for customer in customers:
            customer["_id"] = str(customer["_id"])
        return {"table": customers}
    else:
        return {"message": "Failed to fetch customers"}

@app.get("/products")
def get_products():
    products = product1.find()
    if products:
        # Convert ObjectId to string for JSON serialization
        for product in products:
            product["_id"] = str(product["_id"])
        return {"table": products}

@app.post("/input")
def create_customer(customer: Costumer):
     if costumer1.find_one({"mail": {"$eq": customer["mail"]}}) == None:
        costumer1.insert_one(customer)
     else:
        raise HTTPException(status_code=500, detail="Error creating customer")

@app.post("/input_product")
def create_product(products: Product):
    if product1.find_one({"id": {"$eq":products["id"]}}) == None:
        product1.insert_one(products)
        return {"message": "Products created successfully."}
    else:
        raise HTTPException(status_code=500, detail="Error creating products")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
