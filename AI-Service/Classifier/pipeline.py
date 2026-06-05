"""
pipeline.py — Full end-to-end inference pipeline HematIn (Refactored v6.5 → v7)

Perubahan dari v6.5:
  - OCR engine sekarang murni ONNX (ONNXReceiptOCR via ocr_pipeline.py)
  - Parameter 'engine' dan 'ocr_engine' dihapus dari analyze_receipt()
    karena tidak relevan lagi (tidak ada fallback / multi-engine)
  - get_ocr_engine() sekarang mengembalikan ONNXReceiptOCR instance
  - Semua logika classifier TF (classify_receipt) TIDAK DIUBAH

TIDAK ADA PERUBAHAN pada:
  - classifier_model.py
  - custom_components.py
  - Logika classify_receipt() di bawah
  - Kontrak output analyze_receipt()
"""

from typing import Union
from pathlib import Path
import numpy as np
import tensorflow as tf

import config
from image_preprocessing import preprocess_image
from ocr_pipeline import run_ocr, ocr_to_lines, get_ocr_engine   # API baru — tanpa 'engine' param
from receipt_parser import extract_fields
from custom_components import CUSTOM_OBJECTS


# ═══════════════════════════════════════════════════════════════════════════════
# classify_receipt — TIDAK DIUBAH (identik dengan v6.5)
# ═══════════════════════════════════════════════════════════════════════════════

def classify_receipt(
    clf_text    : str,
    tab_features: list[float],
    clf_model   : tf.keras.Model,
) -> dict:
    """
    Klasifikasikan satu receipt menggunakan classifier TF.

    Args:
        clf_text     : teks yang sudah di-clean_text (dari extract_fields)
        tab_features : list 6 float (dari extract_fields["tab_features"])
        clf_model    : TF model yang sudah di-load

    Returns:
        dict berisi:
            category      : str   — "unknown" jika confidence < threshold
            confidence    : float
            all_probs     : dict  {category: prob}
            is_confident  : bool
    """
    assert len(tab_features) == config.TAB_FEATURES, \
        f"tab_features butuh {config.TAB_FEATURES} elemen, dapat {len(tab_features)}"
    text_input = tf.constant([[clf_text]], dtype=tf.string)
    tab_input  = np.array([tab_features], dtype=np.float32)

    probs      = clf_model.predict(
        {"text": text_input, "tabular": tab_input}, verbose=0
    )[0]

    best_idx   = int(np.argmax(probs))
    confidence = float(probs[best_idx])
    is_conf    = confidence >= config.CONFIDENCE_THRESHOLD
    category   = config.CATEGORIES[best_idx] if is_conf else "unknown"

    return {
        "category"    : category,
        "confidence"  : round(confidence, 4),
        "all_probs"   : {cat: round(float(p), 4)
                         for cat, p in zip(config.CATEGORIES, probs)},
        "is_confident": is_conf,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# analyze_receipt — Patch minimal: hapus parameter 'engine' dan 'ocr_engine'
# ═══════════════════════════════════════════════════════════════════════════════

def analyze_receipt(
    img_source   : Union[str, Path, np.ndarray],
    clf_model    : tf.keras.Model,
    deskew       : bool  = True,
    min_ocr_conf : float = 0.55,
) -> dict:
    """
    Full pipeline: gambar struk → JSON lengkap.

    Aliran data (sesuai Kontrak Tipe Data):
      Tahap 1 → preprocess_image()  : ndarray BGR → ndarray grayscale uint8
      Tahap 2 → run_ocr()           : grayscale → List[Dict] (ONNX output)
      Tahap 3 → extract_fields()    : List[Dict] → {"merchant","items","total",...}
      Tahap 4 → classify_receipt()  : List[str] (items) → TF classifier input
      Tahap 5 → output              : Dict
      Tahap 6 → dict gabungan       : JSON final

    Args:
        img_source   : path file atau np.ndarray BGR/grayscale
        clf_model    : TF classifier model (TIDAK DIMODIFIKASI)
        deskew       : aktifkan koreksi kemiringan
        min_ocr_conf : filter confidence OCR minimum

    Returns:
        dict JSON-friendly (skema identik dengan v6.5):
            preprocessing : info preprocessing
            ocr_lines     : list raw OCR lines
            ocr_count     : jumlah baris
            fields        : hasil extract_fields (tanpa raw_lines)
            classification: hasil classify_receipt
    """
    
    from ocr_pipeline import _ocr_instance
    if _ocr_instance is None:
        raise RuntimeError(
            "OCR engine belum diinisialisasi. Panggil get_ocr_engine() "
            "atau ocr_pipeline.run_ocr() sekali sebelum analyze_receipt()."
        )
        
    # ── Tahap 1: Preprocessing → ndarray grayscale ────────────────────────────
    prep      = preprocess_image(img_source, deskew=deskew)
    ocr_input = prep["ocr_input"]    # ndarray 2D grayscale uint8 (Kontrak Tahap 1)
    bgr       = prep["bgr"]

    # ── Tahap 2: OCR → List[Dict] (Kontrak Tahap 2) ───────────────────────────
    # run_ocr sekarang menerima ndarray 2D grayscale langsung,
    # tidak lagi memerlukan parameter 'engine'.
    ocr_results = run_ocr(ocr_input, min_confidence=min_ocr_conf)

    # ── Adapter: List[Dict] → List[str] untuk receipt_parser.py ──────────────
    # ocr_to_lines() mengambil key "text" dan filter kosong.
    # receipt_parser.py tidak diubah dan masih menerima List[str].
    raw_lines = ocr_to_lines(ocr_results)

    # ── Tahap 3: Parse receipt → Dict (Kontrak Tahap 3) ───────────────────────
    fields = extract_fields(raw_lines)

    # ── Tahap 4-5: Classify → (Kategori, Confidence) (Kontrak Tahap 4 & 5) ───
    # classifier_model.py hanya menerima List[str] dari key "items".
    # classify_receipt() mengambil fields["clf_text"] yang sudah diproses.
    clf_result = classify_receipt(
        clf_text     = fields["clf_text"],
        tab_features = fields["tab_features"],
        clf_model    = clf_model,
    )

    # ── Tahap 6: Final JSON gabungan (Kontrak Tahap 6) ────────────────────────
    return {
        "preprocessing" : {
            "skew_corrected": round(prep["skew"], 2),
            "image_size"    : list(bgr.shape[:2]),
        },
        "ocr_lines"     : raw_lines,
        "ocr_count"     : len(raw_lines),
        "fields"        : {k: v for k, v in fields.items() if k != "raw_lines"},
        "classification": clf_result,
    }
