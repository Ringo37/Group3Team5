import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def to_vector(tags_str, all_tags):
    v = np.zeros(len(all_tags))
    for t in tags_str.split(","):
        t = t.strip()
        if t in all_tags:
            v[all_tags.index(t)] = 1
    return v


def recommend(knowhows, learner, all_tags, top_n=3):
    knowhow_vectors = np.vstack(
        [to_vector(k["tags"], all_tags) for k in knowhows]
    )
    learner_vec = to_vector(learner["interest_tags"], all_tags)
    sim = cosine_similarity([learner_vec], knowhow_vectors)[0]
    top_idx = np.argsort(sim)[::-1][:top_n]
    return [knowhows[i] for i in top_idx]
