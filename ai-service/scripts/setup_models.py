#!/usr/bin/env python3
"""
Model Setup Script for AI Service
Downloads and verifies ML model weights from Hugging Face.

Usage:
    python scripts/setup_models.py [--force] [--model MODEL_NAME]

Options:
    --force         Re-download models even if they exist
    --model NAME    Download only specific model (default: all)
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Optional


def load_config() -> dict:
    """Load models configuration from models_config.json."""
    config_path = Path(__file__).parent.parent / "models_config.json"
    if not config_path.exists():
        print(f"❌ Configuration file not found: {config_path}")
        sys.exit(1)

    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def check_model_exists(local_path: Path) -> bool:
    """Check if model directory exists and contains files."""
    if not local_path.exists():
        return False

    # Check if directory has any files (not just empty)
    return any(local_path.iterdir())


def download_huggingface_model(repo_id: str, local_path: Path, cache_dir: Optional[str] = None) -> bool:
    """Download model from Hugging Face Hub."""
    try:
        from huggingface_hub import snapshot_download

        print(f"📥 Downloading {repo_id} from Hugging Face...")

        # Set cache directory if specified
        if cache_dir:
            os.environ["HF_HOME"] = str(Path(__file__).parent.parent / cache_dir)

        # Download model to specified location
        snapshot_download(
            repo_id=repo_id,
            local_dir=str(local_path),
            local_dir_use_symlinks=False,
        )

        print(f"✅ Successfully downloaded {repo_id}")
        return True

    except ImportError:
        print("❌ huggingface_hub not installed. Run: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"❌ Failed to download {repo_id}: {e}")
        return False


def setup_paddleocr_cache(cache_dir: Path) -> bool:
    """Ensure PaddleOCR cache directory exists."""
    try:
        cache_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ PaddleOCR cache directory ready: {cache_dir}")
        return True
    except Exception as e:
        print(f"❌ Failed to create PaddleOCR cache: {e}")
        return False


def setup_model(model_config: dict, force: bool = False) -> bool:
    """Setup a single model based on its configuration."""
    name = model_config.get("name", "unknown")
    model_type = model_config.get("type", "unknown")
    local_path = Path(__file__).parent.parent / model_config.get("local_path", "")
    required = model_config.get("required", False)

    print(f"\n{'='*60}")
    print(f"Model: {name}")
    print(f"Type: {model_type}")
    print(f"Path: {local_path}")
    print(f"Required: {required}")
    print(f"{'='*60}")

    # Check if model already exists
    if not force and check_model_exists(local_path):
        print(f"✅ Model already exists at {local_path}")
        return True

    # Create parent directory
    local_path.parent.mkdir(parents=True, exist_ok=True)

    # Download based on type
    if model_type == "huggingface":
        repo_id = model_config.get("repo_id")
        cache_dir = model_config.get("cache_dir")

        if not repo_id:
            print(f"⚠️ No repo_id specified for {name}")
            return not required

        success = download_huggingface_model(repo_id, local_path, cache_dir)

        if not success and not required:
            fallback = model_config.get("fallback", "none")
            print(f"⚠️ Optional model failed, will use fallback: {fallback}")
            return True

        return success

    elif model_type == "paddleocr":
        # PaddleOCR downloads models automatically on first use
        # We just ensure the cache directory exists
        success = setup_paddleocr_cache(local_path)

        if success:
            print(f"ℹ️ PaddleOCR will auto-download models on first use")

        return success

    else:
        print(f"❌ Unknown model type: {model_type}")
        return not required


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Setup ML models for AI Service")
    parser.add_argument("--force", action="store_true", help="Force re-download")
    parser.add_argument("--model", type=str, help="Download specific model only")
    args = parser.parse_args()

    print("🚀 AI Service Model Setup")
    print("="*60)

    # Load configuration
    config = load_config()
    models = config.get("models", [])

    if not models:
        print("❌ No models defined in configuration")
        sys.exit(1)

    # Filter models if specific model requested
    if args.model:
        models = [m for m in models if m.get("name") == args.model]
        if not models:
            print(f"❌ Model '{args.model}' not found in configuration")
            sys.exit(1)

    # Setup each model
    failed_required = []
    failed_optional = []

    for model_config in models:
        name = model_config.get("name", "unknown")
        required = model_config.get("required", False)

        success = setup_model(model_config, force=args.force)

        if not success:
            if required:
                failed_required.append(name)
            else:
                failed_optional.append(name)

    # Summary
    print("\n" + "="*60)
    print("📊 Setup Summary")
    print("="*60)

    if failed_required:
        print(f"❌ Required models failed: {', '.join(failed_required)}")
        sys.exit(1)

    if failed_optional:
        print(f"⚠️ Optional models failed: {', '.join(failed_optional)}")
        print("   Service will use fallback methods for these models")

    print("✅ Model setup completed successfully!")
    print("\nNext steps:")
    print("  1. Start the AI Service: python main.py")
    print("  2. Or use Docker: docker build -t ai-service .")


if __name__ == "__main__":
    main()
