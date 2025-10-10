#!/usr/bin/env python3
import re, json, sys
import numpy as np
from sentence_transformers import SentenceTransformer
from opensearchpy import OpenSearch

# --- Config ---
CSS_FILE = "tokens.css"
INDEX_NAME = "tokens"
OPENSEARCH_HOST = "localhost"
OPENSEARCH_PORT = 9200

# --- Connect ---
client = OpenSearch(
    hosts=[{"host": OPENSEARCH_HOST, "port": OPENSEARCH_PORT}],
    http_compress=True,
    use_ssl=False,
    verify_certs=False,
)

# --- Local embedder ---
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


# --- Create index with vector mapping ---
def ensure_index():
    if not client.indices.exists(INDEX_NAME):
        mapping = {
            "settings": {"index": {"knn": True}},
            "mappings": {
                "properties": {
                    "name": {"type": "keyword"},
                    "theme": {"type": "keyword"},
                    "value": {"type": "text"},
                    "embedding": {
                        "type": "knn_vector",
                        "dimension": model.get_sentence_embedding_dimension(),
                        "method": {
                            "name": "hnsw",
                            "space_type": "cosinesimil",
                            "engine": "nmslib",
                        },
                    },
                }
            },
        }
        client.indices.create(INDEX_NAME, body=mapping)
        print(f"Created index: {INDEX_NAME}")


# --- Parse CSS ---
def parse_css():
    pattern = re.compile(r"--([\w-]+)\s*:\s*([^;]+);")
    records = []
    with open(CSS_FILE) as f:
        for line in f:
            m = pattern.search(line)
            if m:
                name, value = m.groups()
                theme = "base"
                records.append(
                    {
                        "name": f"--{name}",
                        "value": value.strip(),
                        "theme": theme,
                        "text": f"Token {name} has value {value.strip()}.",
                    }
                )
    return records


# --- Index tokens ---
def build():
    ensure_index()
    tokens = parse_css()
    for t in tokens:
        emb = model.encode(t["text"])
        doc = {
            "name": t["name"],
            "theme": t["theme"],
            "value": t["value"],
            "embedding": emb.tolist(),
        }
        client.index(index=INDEX_NAME, body=doc)
    client.indices.refresh(INDEX_NAME)
    print(f"Indexed {len(tokens)} tokens")


# --- Query by text ---
def search(query, top_k=5):
    emb = model.encode(query)
    body = {
        "size": top_k,
        "query": {"knn": {"embedding": {"vector": emb.tolist(), "k": top_k}}},
    }
    res = client.search(index=INDEX_NAME, body=body)
    for hit in res["hits"]["hits"]:
        src = hit["_source"]
        print(f"{src['name']:<25} → {src['value']}")


# --- CLI ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: rag_opensearch.py build | search 'query text'")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "build":
        build()
    elif cmd == "search":
        search(" ".join(sys.argv[2:]))
