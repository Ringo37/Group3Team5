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
