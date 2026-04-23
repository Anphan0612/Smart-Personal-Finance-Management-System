# syntax=docker/dockerfile:1.7

# CUDA runtime image for GPU-ready inference workloads (can still run on CPU hosts)
FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/models/cache \
    FLAGS_use_onednn=0 \
    FLAGS_use_mkldnn=0 \
    KMP_DUPLICATE_LIB_OK=TRUE \
    OMP_NUM_THREADS=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 \
    python3-pip \
    python3-dev \
    build-essential \
    git \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN python3.10 -m pip install --upgrade pip setuptools wheel && \
    python3.10 -m pip install -r requirements.txt

# Copy only runtime source to keep build context lean
COPY main.py ./
COPY models ./models
COPY services ./services
COPY utils ./utils

RUN mkdir -p /app/models/cache /app/uploads

EXPOSE 8000
CMD ["python3.10", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
