from fastapi import FastAPI
from .schemas import TextRequest, ExtractKeywordsResponse
from .modules.keyword import extract_keywords_core

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = ""):
    return {"item_id": item_id, "q": q}


# キーワード抽出
@app.post("/extract_keywords", response_model=ExtractKeywordsResponse)
def extract_keywords_api(request: TextRequest):
    try:
        keywords = extract_keywords_core(request.text, request.top_n)
        return {"status": "success", "keywords": keywords}
    except Exception as e:
        return {"status": "error", "message": str(e)}
