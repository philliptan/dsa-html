#!/usr/bin/env python3
import re, json, sys, numpy as np, faiss
from sentence_transformers import SentenceTransformer
from pathlib import Path

CSS_FILE = Path("tokens.css")
JSON_FILE = Path("tokens.json")
INDEX_FILE = Path("tokens.index")

# ---- Initialize local model ----
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


# ---- Parse CSS into token records ----
def parse_tokens():
    pattern = re.compile(r"--([\w-]+)\s*:\s*([^;]+);")
    records = []
    for line in CSS_FILE.read_text().splitlines():
        m = pattern.search(line)
        if m:
            name, value = m.groups()
            text = f"Token {name} with value {value}"
            records.append({"name": f"--{name}", "value": value.strip(), "text": text})
    return records


# ---- Build embeddings & FAISS index ----
def build_index():
    records = parse_tokens()
    texts = [r["text"] for r in records]
    embs = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    index = faiss.IndexFlatIP(embs.shape[1])
    index.add(embs)
    faiss.write_index(index, str(INDEX_FILE))
    JSON_FILE.write_text(json.dumps(records, indent=2))
    print(f"Indexed {len(records)} tokens")


# ---- Query index ----
def search(query, top_k=5):
    index = faiss.read_index(str(INDEX_FILE))
    records = json.loads(JSON_FILE.read_text())
    emb = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)
    D, I = index.search(emb, top_k)
    for idx in I[0]:
        r = records[idx]
        print(f"{r['name']:<25} → {r['value']}")


# ---- CLI interface ----
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: token_rag.py build | search 'query text'")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "build":
        build_index()
    elif cmd == "search":
        search(" ".join(sys.argv[2:]))
