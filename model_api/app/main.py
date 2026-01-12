from fastapi import FastAPI
from .schemas import (
    TextRequest,
    ExtractKeywordsResponse,
    RecommendRequest,
    RecommendResponse,
)
from .modules.keyword import extract_keywords_core
from .modules.recommend import recommend

from itertools import chain


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

    # #修正: タグの空白除去(strip)を行い、正規化したタグリストを作成する
    # これにより " tomato " と "tomato" が一致するようにします
    knowhow_tags_list = [[t.strip() for t in k.tags] for k in request.knowhows]
    learner_tags_list = [
        [t.strip() for t in x.interest_tags] for x in request.learners
    ]

    # タグ集合作成（リスト前提で抜き出し）
    # #修正: 正規化したタグで全タグリストを作成し、sorted()で順序を固定する
    all_tags = sorted(
        list(set(chain.from_iterable(knowhow_tags_list + learner_tags_list)))
    )

    learner = next(
        (le for le in request.learners if le.name == request.user_name), None
    )
    if learner is None:
        return {"recommendations": []}

    # #修正: recommend関数に渡すデータも、正規化（strip）済みのタグに置き換えて渡す
    # (recommend.py側でもstripしていますが、all_tagsとの整合性を確実にするため)

    # knowhowsデータの作成（タグを差し替え）
    knowhows_dicts = []
    for i, k in enumerate(request.knowhows):
        d = k.dict()
        d["tags"] = knowhow_tags_list[i]  # 正規化済みタグリストを使用
        knowhows_dicts.append(d)

    # learnerデータの作成（タグを差し替え）
    learner_dict = learner.dict()
    # 該当ユーザーのタグも正規化済みのものを使用
    learner_dict["interest_tags"] = [t.strip() for t in learner.interest_tags]

    result = recommend(
        knowhows_dicts,
        learner_dict,
        all_tags,
        top_n=request.top_n,
    )
    return {"recommendations": result}
