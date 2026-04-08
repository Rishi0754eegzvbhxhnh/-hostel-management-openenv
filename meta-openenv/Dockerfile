# ── HostelEnv — Meta OpenEnv Docker Image ──────────────────────────────────────
FROM python:3.10-slim

# Set up a new user 'user' with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies (must be done as root)
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*
USER user

# Copy and install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all environment files with correct ownership
COPY --chown=user . .

# Install the project to make entry points (like 'server') available
RUN pip install --no-cache-dir -e .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=$HOME/app

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Start the environment server via the project entry point (Multi-Mode Deployment)
CMD ["server"]
