# syntax=docker/dockerfile:1.4
FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/models/cache \
    FLAGS_use_onednn=0 \
    FLAGS_use_mkldnn=0 \
    KMP_DUPLICATE_LIB_OK=TRUE \
    OMP_NUM_THREADS=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 \
    python3-pip \
    python3-dev \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Add non-root user for security
RUN useradd -m -r aiuser

# Create necessary directories and set ownership before switching user
RUN mkdir -p /app/models/cache /app/uploads && \
    chown -R aiuser:aiuser /app

# Install Python dependencies using BuildKit pip cache
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    python3.10 -m pip install --upgrade pip setuptools wheel && \
    python3.10 -m pip install -r requirements.txt

# Copy model setup script and config BEFORE switching user
# This allows us to download models in a separate layer for better caching
COPY models_config.json ./
COPY scripts ./scripts

# Download ML models (this layer will be cached unless models_config.json changes)
# Run as root to ensure proper permissions, then fix ownership
RUN python3.10 scripts/setup_models.py || echo "Model download failed, will use fallbacks" && \
    chown -R aiuser:aiuser /app/ml-models /app/models/cache 2>/dev/null || true

# Switch to non-root user
USER aiuser

# Copy application source code (ignoring __pycache__ via .dockerignore)
# Code changes won't invalidate the model download layer above
COPY --chown=aiuser:aiuser main.py ./
COPY --chown=aiuser:aiuser models ./models
COPY --chown=aiuser:aiuser services ./services
COPY --chown=aiuser:aiuser utils ./utils

EXPOSE 8000

CMD ["python3.10", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
