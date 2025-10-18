from pydantic import BaseModel


class TextRequest(BaseModel):
    text: str
    top_n: int = 5


class Keyword(BaseModel):
    word: str
    count: int


class KeywordResponse(BaseModel):
    status: str
    keywords: list[Keyword]
