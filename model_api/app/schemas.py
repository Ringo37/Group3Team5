from pydantic import BaseModel
from typing import List, Union


class TextRequest(BaseModel):
    text: str
    top_n: int = 5


class Keyword(BaseModel):
    word: str
    count: int


class ExtractKeywordsSuccess(BaseModel):
    status: str
    keywords: List[Keyword]


class ExtractKeywordsError(BaseModel):
    status: str
    message: str


ExtractKeywordsResponse = Union[ExtractKeywordsSuccess, ExtractKeywordsError]


class KnowHow(BaseModel):
    id: int
    title: str
    tags: List[str]


class Learner(BaseModel):
    user_id: str # ← int から str に変更 
    name: str
    interest_tags: List[str]


class RecommendRequest(BaseModel):
    knowhows: List[KnowHow]
    learners: List[Learner]
    user_name: str
    top_n: int = 5


class RecommendResponse(BaseModel):
    recommendations: list
