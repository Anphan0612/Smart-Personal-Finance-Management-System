# syntax=docker/dockerfile:1.4

# Stage 1: Builder
FROM python:3.10-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3.10 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies using BuildKit pip cache
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    python3.10 -m pip install --upgrade pip setuptools wheel && \
    python3.10 -m pip install -r requirements.txt

# Stage 2: Runtime
FROM python:3.10-slim AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/models/cache \
    FLAGS_use_onednn=0 \
    FLAGS_use_mkldnn=0 \
    KMP_DUPLICATE_LIB_OK=TRUE \
    OMP_NUM_THREADS=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Install runtime dependencies ONLY
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Add non-root user for security
RUN useradd -m -r aiuser

# Create necessary directories and set ownership before switching user
RUN mkdir -p /app/models/cache /app/uploads /app/ml-models && \
    chown -R aiuser:aiuser /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy model setup script and config BEFORE switching user
COPY models_config.json ./
COPY scripts ./scripts

# Download ML models (this layer will be cached unless models_config.json changes)
RUN python3.10 scripts/setup_models.py || echo "Model download failed, will use fallbacks" && \
    chown -R aiuser:aiuser /app/ml-models /app/models/cache 2>/dev/null || true

# Switch to non-root user
USER aiuser

# Copy application source code (ignoring __pycache__ via .dockerignore)
COPY --chown=aiuser:aiuser main.py ./
COPY --chown=aiuser:aiuser models ./models
COPY --chown=aiuser:aiuser services ./services
COPY --chown=aiuser:aiuser utils ./utils

EXPOSE 8000

CMD ["python3.10", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
