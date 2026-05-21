FROM python:3.12-slim

# Install Node.js 20
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Frontend build
COPY frontend/package*.json frontend/
RUN npm --prefix frontend install

COPY frontend/ frontend/
RUN npm --prefix frontend run build

# Backend
COPY app/ app/

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
