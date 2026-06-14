import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="ElderShield API",
    description="NLP-based legal fine-print risk extractor for elder accessibility",
    version="1.0.0",
)

# Explicit origins avoid browser CORS failures when credentials/settings are involved.
_default_origins = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "Welcome to the ElderShield API. Go to /docs for Swagger endpoints.",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(analyze_router, prefix="/api", tags=["Analysis"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
