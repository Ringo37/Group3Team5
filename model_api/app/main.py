from fastapi import FastAPI
from .schemas import (
    TextRequest,
    ExtractKeywordsResponse,
    RecommendRequest,
    RecommendResponse,
)
from .modules.keyword import extract_keywords_core
from .modules.recommend import recommend


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


@app.post("/recommend", response_model=RecommendResponse)
def recommend_api(request: RecommendRequest):
    # 1. タグ集合作成
    all_tags = list(
        set(
            sum(
                [m.tags.split(",") for m in request.knowhows]
                + [n.interest_tags.split(",") for n in request.learners],
                [],
            )
        )
    )
    learner = next(
        (le for le in request.learners if le.name == request.user_name), None
    )
    if learner is None:
        return {"recommendations": []}
    result = recommend(
        [k.dict() for k in request.knowhows],
        learner.dict(),
        all_tags,
        top_n=request.top_n,
    )
    return {"recommendations": result}
