# ── HostelEnv — Meta OpenEnv Docker Image ──────────────────────────────────────
# Supports two modes:
#   1. SERVER mode (default): Runs the FastAPI environment server on port 7860
#   2. INFERENCE mode: Runs inference.py against the server
#
# Build:  docker build -t hostel-openenv .
# Run:    docker run -p 7860:7860 hostel-openenv
# ───────────────────────────────────────────────────────────────────────────────

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all environment files
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Start the FastAPI server (OpenEnv standard)
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860"]
