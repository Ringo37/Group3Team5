from janome.tokenizer import Tokenizer, Token
from collections import Counter
from typing import List, Dict, Any, cast

tokenizer = Tokenizer()


def extract_keywords_core(text: str, top_n: int) -> List[Dict[str, Any]]:
    nouns: List[str] = []

    tokens = cast(List[Token], list(tokenizer.tokenize(text)))

    for token in tokens:
        if token.part_of_speech.startswith("名詞"):
            nouns.append(token.surface)

    word_counts = Counter(nouns)
    return [
        {"word": word, "count": count}
        for word, count in word_counts.most_common(top_n)
    ]
