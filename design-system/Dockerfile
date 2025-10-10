# Lightweight Python image
FROM python:3.11-slim

# Environment setup
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scripts
COPY local_token_rag_opensearch.py .
COPY tokens.css .

# Default command prints help
ENTRYPOINT ["python", "local_token_rag_opensearch.py"]
CMD ["--help"]
