"""
config.py — Konfigurasi terpusat HematIn v5
Semua konstanta, path, dan fungsi utilitas didefinisikan di sini.
"""
import re
import numpy as np
from pathlib import Path
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
CORD_DIR  = Path("/kaggle/input/datasets/lonelvino/cord-1000/CORD/CORD")
CSV_PATH  = Path("/kaggle/input/datasets/herdinthorikn/capstonedataset/pengeluaran_model2.csv")

MODEL_DIR      = Path("/kaggle/input/datasets/herdinthorikn/capstonedataset")
INFER_DIR      = Path("/kaggle/input/datasets/herdinthorikn/capstonedataset/OCR_Inferencev2")
# MODEL_DIR.mkdir(parents=True, exist_ok=True)
# INFER_DIR.mkdir(parents=True, exist_ok=True)
CLF_MODEL_PATH ="/kaggle/working/models/hematin_classifier.keras"
VOCAB_PATH     = "/kaggle/working/models/vectorizer_vocab.json"

# ── Classifier ────────────────────────────────────────────────────────────────
CATEGORIES = [
    "Makanan/Minuman", "Hiburan", "Kesehatan",
    "Belanja", "Transportasi", "Pendidikan",
    "Tagihan/Utilitas", "Investasi", "Keuangan", "Lain-lain"
]
CAT2IDX     = {c: i for i, c in enumerate(CATEGORIES)}
NUM_CLASSES = len(CATEGORIES)

MAX_PLAUSIBLE_TOTAL = 50_000_000

CAT_REMAP = {
    "Sosial"   : "Lain-lain",
    "Olahraga" : "Kesehatan",
}

SEED = 42
TEXT_VOCAB_SZ    = 6000
MAX_TEXT_LEN     = 40
EMBED_DIM        = 64

TAB_FEATURES     = 6   # normalized_total, log_total, price_per_item_norm, item_count_norm, is_food_range, is_large_purchase

CLF_BATCH_SIZE   = 32
CLF_EPOCHS       = 60
CLF_LR           = 1e-3
VALIDATION_SPLIT = 0.20

# ── Inference ─────────────────────────────────────────────────────────────────
CONFIDENCE_THRESHOLD = 0.55   # di bawah ini → category = "unknown"

AUGMENT_WITH_NOISE = True
OCR_NOISE_PROB     = 0.15

# ── TensorBoard ───────────────────────────────────────────────────────────────
RUN_TIME   = datetime.now().strftime("%Y%m%d-%H%M%S")
TB_LOG_DIR = f"/kaggle/working/tensorboard_logs/{RUN_TIME}"


# ── Text Preprocessing ────────────────────────────────────────────────────────
def clean_text(text: str) -> str:
    """
    Pembersihan teks kanonik — HANYA untuk input classifier TF.
    JANGAN gunakan untuk parsing item dari OCR lines.

    Langkah:
        1. Guard None / NaN → ""
        2. Lowercase
        3. Ganti non-alfanumerik & non-spasi dengan spasi
        4. Collapse whitespace, strip
    """
    if text is None or (isinstance(text, float) and np.isnan(text)):
        return ""
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ── Tabular Features ──────────────────────────────────────────────────────────
def build_tabular_features(
    total      : float,
    avg_price  : float = 0.0,
    item_count : int   = 1,
) -> np.ndarray:

    safe_total      = max(float(total)     if total == total else 0.0, 0.0)
    safe_avg        = max(float(avg_price) if avg_price == avg_price else 0.0, 0.0)
    safe_item_count = max(int(item_count)  if item_count == item_count else 1, 1)
 
    normalized_total    = min(safe_total / 1_000_000, 10.0)
    log_total           = float(np.log1p(safe_total / 1_000))
    price_per_item_norm = min(safe_avg / 500_000, 1.0)
    item_count_norm     = min(float(safe_item_count) / 20.0, 1.0)
    is_food_range       = 1.0 if 3_000 <= safe_total <= 150_000 else 0.0
    is_large_purchase   = 1.0 if safe_total > 500_000 else 0.0
 
    return np.array([
        normalized_total,
        log_total,
        price_per_item_norm,
        item_count_norm,
        is_food_range,
        is_large_purchase,
    ], dtype=np.float32)
