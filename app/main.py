from fastapi import FastAPI
from app.api.routes import patients,auth


app = FastAPI()

app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
def root():
    return {"message":"Welcome to Swecha Health Records System"}