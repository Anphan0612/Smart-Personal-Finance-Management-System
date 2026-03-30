"""
Run Issue #20 benchmark for NLP Transaction Parser.

Protocol reference:
  docs/03-ai-nlp/nlp-benchmark-protocol.md

This script:
  - Loads CSV dataset from `docs/03-ai-nlp/nlp-benchmark-dataset-v1.csv`
    (generates a deterministic subset from v2 if the v1 file is missing)
  - Evaluates 100 rows by default (v1 protocol)
  - Calls FastAPI endpoint for each sample
  - Computes metrics and writes raw predictions to CSV
  - Prints metric comparison vs local baseline and Top-10 failures by bucket
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

# Ensure `import api.*` works when running this file directly:
#   python api/benchmark/run_benchmark_v1.py
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from api.main import app  # noqa: E402


@dataclass(frozen=True)
class BenchmarkRow:
    id: str
    text: str
    expected_amount: int
    expected_type: str
    expected_category: str
    expected_date_hint: str
    expected_note: str


def _repo_root() -> Path:
    # api/benchmark/run_benchmark_v1.py -> api/benchmark -> api -> repo_root
    return Path(__file__).resolve().parents[2]


def _load_rows(csv_path: Path) -> list[BenchmarkRow]:
    rows: list[BenchmarkRow] = []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            rows.append(
                BenchmarkRow(
                    id=str(raw["id"]),
                    text=str(raw["text"]),
                    expected_amount=int(raw["expected_amount"]),
                    expected_type=str(raw["expected_type"]),
                    expected_category=str(raw["expected_category"]),
                    expected_date_hint=str(raw.get("expected_date_hint", "") or ""),
                    expected_note=str(raw.get("expected_note", "") or ""),
                )
            )
    return rows


def _clamp01(x: float) -> float:
    if x < 0.0:
        return 0.0
    if x > 1.0:
        return 1.0
    return x


def _safe_confidence(value: Any) -> float:
    try:
        return _clamp01(float(value))
    except Exception:
        return 0.0


def _ascii_safe(text: str, max_len: int) -> str:
    preview = text[:max_len]
    # Windows terminals may not support UTF-8 reliably; avoid UnicodeEncodeError.
    return "".join(ch if ord(ch) < 128 else "?" for ch in preview)


def _predict(client: TestClient, text: str) -> tuple[bool, dict[str, Any] | None, str | None]:
    res = client.post("/api/ai/extract-transaction", json={"text": text})

    if res.status_code == 200:
        return True, res.json(), None

    if res.status_code == 422:
        payload = res.json()
        detail = payload.get("detail")
        if isinstance(detail, dict) and isinstance(detail.get("error"), str):
            return False, None, str(detail["error"])
        return False, None, "VALIDATION_ERROR"

    return False, None, f"HTTP_{res.status_code}"


def _metrics_snapshot(amount_acc: float, type_acc: float, category_acc: float, all_fields_acc: float, parse_success_rate: float) -> dict[str, float]:
    return {
        "amount_exact_accuracy": amount_acc,
        "type_accuracy": type_acc,
        "category_accuracy": category_acc,
        "all_fields_accuracy": all_fields_acc,
        "parse_success_rate": parse_success_rate,
    }


def _load_baseline(baseline_path: Path) -> dict[str, float]:
    if not baseline_path.exists():
        return {}
    try:
        raw = baseline_path.read_text(encoding="utf-8")
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            out: dict[str, float] = {}
            for k, v in parsed.items():
                out[str(k)] = float(v)
            return out
    except Exception:
        return {}
    return {}


def _save_baseline(baseline_path: Path, metrics: dict[str, float]) -> None:
    baseline_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")


def _classify_failure(
    *,
    ok: bool,
    pred: dict[str, Any] | None,
    expected_amount: int,
    expected_type: str,
    expected_category: str,
) -> str:
    if not ok or pred is None:
        return "system_timeout"

    pred_amount = pred.get("amount")
    pred_type = pred.get("type")
    pred_category = pred.get("category")
    pred_date = pred.get("date")

    if pred_date is None or pred_type is None:
        return "missing_date_type"

    amount_is_correct = pred_amount == expected_amount
    category_is_correct = pred_category == expected_category
    type_is_correct = pred_type == expected_type

    if not amount_is_correct:
        return "amount_wrong"
    if not category_is_correct:
        return "category_wrong"
    if not type_is_correct:
        return "type_wrong"
    return "unknown"


def _ensure_v1_dataset(dataset_path: Path, *, seed: int, sample_size: int) -> None:
    """
    Ensure `dataset_path` exists.

    If missing, generate a deterministic subset from v2 dataset.
    """
    if dataset_path.exists():
        return

    v2_path = dataset_path.parents[2] / "phobert-finance-ner-final" / "dtb_train" / "nlp-train-dataset-v2.csv"
    if not v2_path.exists():
        raise SystemExit(f"Neither v1 dataset nor v2 dataset exists. v2 not found at: {v2_path}")

    # Load v2 rows and sample deterministically.
    all_rows = _load_rows(v2_path)
    rng = random.Random(seed)
    sampled = all_rows[:]
    rng.shuffle(sampled)
    sampled = sampled[: min(max(sample_size, 0), len(sampled))] if sample_size > 0 else sampled

    dataset_path.parent.mkdir(parents=True, exist_ok=True)
    with dataset_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "text", "expected_amount", "expected_type", "expected_category", "expected_date_hint", "expected_note"])
        for row in sampled:
            writer.writerow([
                row.id,
                row.text,
                row.expected_amount,
                row.expected_type,
                row.expected_category,
                row.expected_date_hint,
                row.expected_note,
            ])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, default="docs/03-ai-nlp/nlp-benchmark-dataset-v1.csv")
    parser.add_argument("--sample-size", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output-dir", type=str, default="api/benchmark")
    parser.add_argument(
        "--enable-llm-repair",
        action="store_true",
        default=False,
        help="Enable Groq LLM repair during benchmark. Default is disabled to keep cost/reproducibility stable.",
    )
    args = parser.parse_args()

    repo_root = _repo_root()
    dataset_path = repo_root / args.dataset
    _ensure_v1_dataset(dataset_path, seed=args.seed, sample_size=args.sample_size)

    output_dir = repo_root / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    all_rows = _load_rows(dataset_path)
    if args.sample_size <= 0:
        sampled = all_rows
    else:
        rng = random.Random(args.seed)
        sampled = all_rows[:]
        # Keep deterministic sampling but avoid random shuffle by default for stable Top-10.
        rng.shuffle(sampled)
        sampled = sampled[: min(args.sample_size, len(sampled))]

    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    out_csv = output_dir / f"benchmark-result-v1-{timestamp}.csv"
    baseline_path = output_dir / "benchmark-baseline-v1.json"

    fieldnames = [
        "id",
        "text",
        "expected_amount",
        "expected_type",
        "expected_category",
        "pred_amount",
        "pred_type",
        "pred_category",
        "date",
        "note",
        "confidence",
        "success",
        "error_code",
        "amount_correct",
        "type_correct",
        "category_correct",
        "all_fields_correct",
        "duration_ms",
        "error_bucket",
        "error_code",
    ]

    amount_correct = 0
    type_correct = 0
    category_correct = 0
    all_fields_correct = 0
    success_count = 0

    # Failures: we keep mismatches (even when HTTP=200) to build Top-10 by bucket.
    failures: list[dict[str, Any]] = []

    # Keep LLM calls disabled by default for reproducibility and to avoid Groq cost.
    if not args.enable_llm_repair:
        import os

        os.environ["ENABLE_LLM_REPAIR"] = "false"

    baseline_before = _load_baseline(baseline_path)

    with TestClient(app) as client:
        with out_csv.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for row in sampled:
                start = time.time()
                ok, pred, error_code = _predict(client, row.text)
                duration_ms = int((time.time() - start) * 1000)

                pred_amount = pred.get("amount") if pred else None
                pred_type = pred.get("type") if pred else None
                pred_category = pred.get("category") if pred else None
                pred_date = pred.get("date") if pred else None
                pred_note = pred.get("note") if pred else None
                confidence = _safe_confidence(pred.get("confidence") if pred else None)
                error_bucket = ""
                row_error_code = error_code or ""

                amount_is_correct = ok and pred_amount == row.expected_amount
                type_is_correct = ok and pred_type == row.expected_type
                category_is_correct = ok and pred_category == row.expected_category
                all_is_correct = amount_is_correct and type_is_correct and category_is_correct

                if ok:
                    success_count += 1
                    amount_correct += int(amount_is_correct)
                    type_correct += int(type_is_correct)
                    category_correct += int(category_is_correct)
                    all_fields_correct += int(all_is_correct)
                else:
                    # HTTP failure bucketed into "system/timeout".
                    bucket = "system_timeout"
                    error_bucket = bucket
                    failures.append(
                        {
                            "id": row.id,
                            "text": row.text,
                            "expected_amount": row.expected_amount,
                            "expected_type": row.expected_type,
                            "expected_category": row.expected_category,
                            "pred_amount": pred_amount,
                            "pred_type": pred_type,
                            "pred_category": pred_category,
                            "bucket": bucket,
                            "error_code": error_code,
                            "duration_ms": duration_ms,
                        }
                    )

                if ok and not all_is_correct:
                    bucket = _classify_failure(
                        ok=True,
                        pred=pred,
                        expected_amount=row.expected_amount,
                        expected_type=row.expected_type,
                        expected_category=row.expected_category,
                    )
                    error_bucket = bucket
                    failures.append(
                        {
                            "id": row.id,
                            "text": row.text,
                            "expected_amount": row.expected_amount,
                            "expected_type": row.expected_type,
                            "expected_category": row.expected_category,
                            "pred_amount": pred_amount,
                            "pred_type": pred_type,
                            "pred_category": pred_category,
                            "bucket": bucket,
                            "error_code": error_code,
                            "duration_ms": duration_ms,
                        }
                    )

                writer.writerow(
                    {
                        "id": row.id,
                        "text": row.text,
                        "expected_amount": row.expected_amount,
                        "expected_type": row.expected_type,
                        "expected_category": row.expected_category,
                        "pred_amount": pred_amount,
                        "pred_type": pred_type,
                        "pred_category": pred_category,
                        "date": pred_date,
                        "note": pred_note,
                        "confidence": confidence,
                        "success": int(ok),
                        "error_code": row_error_code,
                        "amount_correct": int(amount_is_correct),
                        "type_correct": int(type_is_correct),
                        "category_correct": int(category_is_correct),
                        "all_fields_correct": int(all_is_correct),
                        "duration_ms": duration_ms,
                        "error_bucket": error_bucket,
                    }
                )

    total = len(sampled)
    amount_acc = amount_correct / total if total else 0.0
    type_acc = type_correct / total if total else 0.0
    category_acc = category_correct / total if total else 0.0
    all_fields_acc = all_fields_correct / total if total else 0.0
    parse_success_rate = success_count / total if total else 0.0

    metrics_now = _metrics_snapshot(amount_acc, type_acc, category_acc, all_fields_acc, parse_success_rate)

    print("\n--- Benchmark v1 ---")
    print(f"Dataset: {dataset_path}")
    print(f"Sample size: {total}")
    print(f"Output: {out_csv}")
    print("")
    print(f"Amount Exact Accuracy: {amount_acc:.2f}")
    print(f"Type Accuracy: {type_acc:.2f}")
    print(f"Category Accuracy: {category_acc:.2f}")
    print(f"All-fields Accuracy: {all_fields_acc:.2f}")
    print(f"Parse Success Rate: {parse_success_rate:.2f}")

    # Metric comparison vs baseline
    if baseline_before:
        print("\n--- Metrics vs Baseline (local) ---")
        keys = [
            "amount_exact_accuracy",
            "type_accuracy",
            "category_accuracy",
            "all_fields_accuracy",
            "parse_success_rate",
        ]
        print(f"{'Metric':<28} {'Current':>8} {'Baseline':>9} {'Delta':>8}")
        for k in keys:
            cur = metrics_now.get(k, 0.0)
            base = baseline_before.get(k, 0.0)
            delta = cur - base
            pretty = k.replace("_", " ").title()
            print(f"{pretty:<28} {cur:>8.2f} {base:>9.2f} {delta:>8.2f}")

    _save_baseline(baseline_path, metrics_now)

    # Top failures: prioritize missing/failed parses first.
    if failures:
        print("\n--- Top-10 Failures (bucketed) ---")
        buckets = ["amount_wrong", "category_wrong", "type_wrong", "missing_date_type", "system_timeout", "unknown"]
        for b in buckets:
            items = [x for x in failures if x.get("bucket") == b]
            if not items:
                continue
            print(f"\n[{b}]")
            for frow in items[:10]:
                text_preview = _ascii_safe(str(frow["text"]), 60)
                print(
                    f"- id={frow['id']} err={frow['error_code'] or ''} "
                    f"dur_ms={frow['duration_ms']} text={text_preview}"
                )
        # Also print a quick overall top-10.
        print("\n[Top10Overall]")
        for frow in failures[:10]:
            text_preview = _ascii_safe(str(frow["text"]), 60)
            print(f"- id={frow['id']} bucket={frow['bucket']} text={text_preview}")


if __name__ == "__main__":
    main()

