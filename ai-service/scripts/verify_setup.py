#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verification script for ML Model Integration
Tests that models are properly downloaded and services can initialize.
"""

import os
import sys
from pathlib import Path

# Fix Windows console encoding issues
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def check_file_exists(path: Path, description: str) -> bool:
    """Check if a file or directory exists."""
    if path.exists():
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description} NOT FOUND: {path}")
        return False


def check_directory_not_empty(path: Path, description: str) -> bool:
    """Check if directory exists and contains files."""
    if not path.exists():
        print(f"❌ {description} does not exist: {path}")
        return False

    if not any(path.iterdir()):
        print(f"⚠️ {description} is empty: {path}")
        return False

    file_count = len(list(path.rglob("*")))
    print(f"✅ {description}: {path} ({file_count} files)")
    return True


def verify_gitignore() -> bool:
    """Verify .gitignore excludes model directories."""
    gitignore_path = Path(__file__).parent.parent / ".gitignore"

    if not gitignore_path.exists():
        print("❌ .gitignore not found")
        return False

    content = gitignore_path.read_text()
    required_entries = ["ml-models/", "models/cache/"]

    missing = [entry for entry in required_entries if entry not in content]

    if missing:
        print(f"❌ .gitignore missing entries: {missing}")
        return False

    print("✅ .gitignore properly configured")
    return True


def verify_services_can_import() -> bool:
    """Verify that services can be imported without errors."""
    try:
        sys.path.insert(0, str(Path(__file__).parent.parent))

        print("\n📦 Testing service imports...")

        from services.ner_service import NERService
        print("✅ NER Service imported successfully")

        from services.ocr_service import OCRService
        print("✅ OCR Service imported successfully")

        return True
    except Exception as e:
        print(f"❌ Service import failed: {e}")
        return False


def main():
    """Run all verification checks."""
    print("🔍 AI Service Model Integration Verification")
    print("=" * 60)

    base_dir = Path(__file__).parent.parent

    checks = []

    # 1. Check configuration files
    print("\n📋 Configuration Files:")
    checks.append(check_file_exists(
        base_dir / "models_config.json",
        "models_config.json"
    ))
    checks.append(check_file_exists(
        base_dir / "scripts" / "setup_models.py",
        "setup_models.py"
    ))

    # 2. Check bootstrap scripts
    print("\n🚀 Bootstrap Scripts:")
    checks.append(check_file_exists(
        base_dir / "start-ai.ps1",
        "start-ai.ps1"
    ))
    checks.append(check_file_exists(
        base_dir / "start-ai.sh",
        "start-ai.sh"
    ))

    # 3. Check Docker files
    print("\n🐳 Docker Configuration:")
    checks.append(check_file_exists(
        base_dir / "Dockerfile",
        "Dockerfile"
    ))
    checks.append(check_file_exists(
        base_dir / ".dockerignore",
        ".dockerignore"
    ))

    # 4. Check gitignore
    print("\n📝 Git Configuration:")
    checks.append(verify_gitignore())

    # 5. Check model directories (optional - may not exist yet)
    print("\n🤖 Model Directories (optional):")
    ml_models_exists = check_directory_not_empty(
        base_dir / "ml-models",
        "PhoBERT models (ml-models/)"
    )

    cache_exists = check_directory_not_empty(
        base_dir / "models" / "cache",
        "Hugging Face cache (models/cache/)"
    )

    if not ml_models_exists and not cache_exists:
        print("\n⚠️ No models found. This is OK for first-time setup.")
        print("💡 Run 'python scripts/setup_models.py' to download models.")

    # 6. Test service imports
    print("\n🔧 Service Initialization:")
    checks.append(verify_services_can_import())

    # Summary
    print("\n" + "=" * 60)
    print("📊 Verification Summary")
    print("=" * 60)

    passed = sum(checks)
    total = len(checks)

    if passed == total:
        print(f"✅ All {total} checks passed!")
        print("\n✨ Model integration is properly configured.")
        print("\nNext steps:")
        print("  1. Run: python scripts/setup_models.py")
        print("  2. Start service: python main.py")
        print("  3. Or use Docker: docker build -t ai-service .")
        return 0
    else:
        print(f"❌ {total - passed} of {total} checks failed")
        print("\n⚠️ Please fix the issues above before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
