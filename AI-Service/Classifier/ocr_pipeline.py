"""
ocr_pipeline.py — ONNX Receipt OCR Pipeline (HematIn Fine-tuned)

Menggantikan pipeline lama berbasis TF custom CRNN + ocr_inference.py.
Menggunakan onnxruntime murni dengan dua model ONNX yang sudah di-fine-tune:
  - hematin_detector.onnx     : PP-OCRv5 mobile det (fine-tuned ~230 struk)
  - hematin_recognition.onnx  : PP-OCRv5 server rec student (fine-tuned CORD-1000)

Target eksekusi: CPU 2-core (Hugging Face Spaces, 2 vCPU).
SessionOptions dikonfigurasi eksplisit untuk menghindari over-threading.

Kontrak Tipe Data (Tahap 1 → Tahap 2):
  Input  : numpy.ndarray — matriks 2D grayscale uint8 (H, W)
  Output : List[Dict] dengan keys wajib:
           {"text": str, "bbox": List[int], "y_center": float, "confidence": float}
           Diurutkan berdasarkan y_center ascending.

Fungsi publik yang dipertahankan (kompatibel dengan pipeline.py dan receipt_parser.py):
  run_ocr(img_source)  → List[Dict]
  ocr_to_lines(results) → List[str]   [adapter untuk receipt_parser.py]
  get_ocr_engine()     → ONNXReceiptOCR   [untuk backward compat pipeline.py]
"""

from __future__ import annotations

import logging
import warnings
from pathlib import Path
from typing import Union

import cv2
import os
import numpy as np
import onnxruntime as ort

# ── Konfigurasi paths model ────
_DEFAULT_MODEL_DIR = Path("/kaggle/input/datasets/herdinthorikn/capstonedataset/OCR_Inference/OCR_Inference")
_DEFAULT_ONNX_DIR = Path("/kaggle/input/datasets/herdinthorikn/capstonedataset/hematin_onnx_models")


DET_MODEL_PATH     = Path(os.environ.get("FINTRACK_DET_MODEL", str(_DEFAULT_ONNX_DIR / "hematin_detector_v1.onnx")))
REC_MODEL_PATH     = Path(os.environ.get("FINTRACK_REC_MODEL", str(_DEFAULT_ONNX_DIR / "hematin_recognition.onnx")))
REC_CHAR_DICT_PATH = Path(os.environ.get("FINTRACK_CHAR_DICT", str(_DEFAULT_ONNX_DIR / "rec_char_dict.txt")))

# ── Hyperparameter inferensi ───────────────────────────────────────────────────
DET_LIMIT_SIDE_LEN: int   = 960     # resize sisi terpanjang ke nilai ini sebelum deteksi
DET_THRESH:         float = 0.5     # threshold binarisasi probability map
DET_BOX_THRESH:     float = 0.1     # threshold rata-rata prob dalam box
DET_UNCLIP_RATIO:   float = 1.6     # ekspansi box (DB post-processing)
REC_IMG_H:          int   = 48      # tinggi standar input recognizer
REC_IMG_W:          int   = 320     # lebar standar input recognizer
REC_BATCH_SIZE:     int   = 8       # proses N crops sekaligus
MIN_CONFIDENCE:     float = 0.3     # filter confidence rendah

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# Utility: ONNX SessionOptions builder
# ═══════════════════════════════════════════════════════════════════════════════

def _build_session_options() -> ort.SessionOptions:
    """
    Bangun SessionOptions yang dioptimalkan untuk CPU 2-core.

    intra_op_num_threads = 2  : paralelisme dalam satu op (sesuai jumlah vCPU)
    inter_op_num_threads = 1  : serialisasi antar op (menghindari context switch
                                 yang tidak efisien pada CPU rendah)
    graph_optimization_level = ORT_ENABLE_ALL : aktifkan semua optimasi graph.
    """
    opts = ort.SessionOptions()
    opts.intra_op_num_threads      = 2
    opts.inter_op_num_threads      = 1
    opts.graph_optimization_level  = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    opts.log_severity_level        = 3   # ERROR only — suppress INFO noise
    return opts


# ═══════════════════════════════════════════════════════════════════════════════
# Charset Loader
# ═══════════════════════════════════════════════════════════════════════════════

def _load_charset(dict_path: Path) -> list[str]:
    """
    Load karakter dictionary untuk recognizer.
    File berisi satu karakter per baris (PaddleOCR format).
    Index 0 = blank (CTC).
    """
    if not dict_path.exists():
        warnings.warn(
            f"[OCR] Char dict tidak ditemukan: {dict_path}. "
            "Menggunakan ASCII printable sebagai fallback."
        )
        return [""] + [chr(i) for i in range(32, 127)]

    chars: list[str] = [""]   # index 0 = CTC blank
    with open(dict_path, "r", encoding="utf-8") as f:
        for line in f:
            char = line.rstrip("\n")
            if char:
                chars.append(char)
    return chars


# ═══════════════════════════════════════════════════════════════════════════════
# Detection Post-Processing (DB Algorithm)
# ═══════════════════════════════════════════════════════════════════════════════

def _db_postprocess(
    prob_map: np.ndarray,
    orig_h: int,
    orig_w: int,
    det_thresh: float    = DET_THRESH,
    box_thresh: float    = DET_BOX_THRESH,
    unclip_ratio: float  = DET_UNCLIP_RATIO,
    max_candidates: int  = 1000,
) -> list[list[int]]:
    """
    DB (Differentiable Binarization) post-processing.

    Args:
        prob_map   : (H, W) float32 — output sigmoid dari detektor
        orig_h/w   : dimensi gambar original sebelum resize ke model
        det_thresh : threshold binarisasi awal
        box_thresh : threshold rata-rata probabilitas dalam polygon
        unclip_ratio: rasio ekspansi Vatti clipping

    Returns:
        list of [x_min, y_min, x_max, y_max] dalam koordinat original.
    """
    import cv2 as _cv2

    # Binarisasi
    binary = (prob_map > det_thresh).astype(np.uint8) * 255

    # Temukan contours
    contours, _ = _cv2.findContours(binary, _cv2.RETR_LIST, _cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return []

    # Rasio scale dari model input ke original
    scale_h = orig_h / prob_map.shape[0]
    scale_w = orig_w / prob_map.shape[1]

    boxes: list[list[int]] = []
    for cnt in contours[:max_candidates]:
        if cnt.shape[0] < 4:
            continue

        # Rata-rata prob dalam bounding rect
        rect = _cv2.boundingRect(cnt)
        x, y, bw, bh = rect
        mask_roi  = binary[y : y + bh, x : x + bw]
        prob_roi  = prob_map[y : y + bh, x : x + bw]
        mean_prob = float(prob_roi[mask_roi > 0].mean()) if mask_roi.any() else 0.0

        if mean_prob < box_thresh:
            continue

        # Unclip (expand) polygon menggunakan Vatti clipping via offset
        # Implementasi sederhana: expand bounding rect secara proporsional
        area      = float(_cv2.contourArea(cnt))
        perimeter = float(_cv2.arcLength(cnt, True))
        if perimeter < 1e-5:
            continue

        distance  = area * unclip_ratio / perimeter
        x_min_exp = max(0, x - int(distance))
        y_min_exp = max(0, y - int(distance))
        x_max_exp = min(prob_map.shape[1], x + bw + int(distance))
        y_max_exp = min(prob_map.shape[0], y + bh + int(distance))

        # Scale ke koordinat original
        x_min_orig = int(x_min_exp * scale_w)
        y_min_orig = int(y_min_exp * scale_h)
        x_max_orig = int(x_max_exp * scale_w)
        y_max_orig = int(y_max_exp * scale_h)

        # Clamp ke batas gambar
        x_min_orig = max(0, min(orig_w, x_min_orig))
        y_min_orig = max(0, min(orig_h, y_min_orig))
        x_max_orig = max(0, min(orig_w, x_max_orig))
        y_max_orig = max(0, min(orig_h, y_max_orig))

        if (x_max_orig - x_min_orig) < 3 or (y_max_orig - y_min_orig) < 3:
            continue

        boxes.append([x_min_orig, y_min_orig, x_max_orig, y_max_orig])

    return boxes


# ═══════════════════════════════════════════════════════════════════════════════
# Recognition Post-Processing (CTC Greedy Decode)
# ═══════════════════════════════════════════════════════════════════════════════

def _ctc_greedy_decode(logits: np.ndarray, charset: list[str]) -> tuple[str, float]:
    """
    Greedy CTC decode dari output recognizer.

    Args:
        logits  : (T, num_classes) float32 — raw logits atau softmax output
        charset : list karakter; index 0 = CTC blank

    Returns:
        (decoded_text, mean_confidence)
    """
    # Softmax jika belum (output bisa berupa raw logits)
    if logits.max() > 1.0 or logits.min() < 0.0:
        exp_l = np.exp(logits - logits.max(axis=-1, keepdims=True))
        probs = exp_l / exp_l.sum(axis=-1, keepdims=True)
    else:
        probs = logits

    pred_indices = probs.argmax(axis=-1)   # (T,)
    pred_probs   = probs.max(axis=-1)      # (T,)

    # CTC greedy: hapus blank dan duplicate berurutan
    chars: list[str] = []
    conf_list: list[float] = []
    prev_idx = -1

    for t, idx in enumerate(pred_indices):
        if idx == 0:          # blank
            prev_idx = 0
            continue
        if idx == prev_idx:   # duplicate
            continue
        if idx < len(charset):
            chars.append(charset[idx])
            conf_list.append(float(pred_probs[t]))
        prev_idx = idx

    text       = "".join(chars)
    confidence = float(np.mean(conf_list)) if conf_list else 0.0
    return text, confidence


# ═══════════════════════════════════════════════════════════════════════════════
# ONNXReceiptOCR — Class utama
# ═══════════════════════════════════════════════════════════════════════════════

class ONNXReceiptOCR:
    """
    Two-stage OCR menggunakan PP-OCRv4 yang di-fine-tune, dijalankan via ONNX Runtime.

    Stage 1 (Detection)   : hematin_detector.onnx   — menghasilkan bounding boxes teks
    Stage 2 (Recognition) : hematin_recognition.onnx — membaca teks dari setiap crop

    Didesain untuk CPU 2-core; session dikonfigurasi dengan intra/inter thread
    sesuai kontrak deployment (Hugging Face Spaces, 2 vCPU).

    Usage:
        ocr = ONNXReceiptOCR()
        results = ocr.recognize(gray_image)   # gray_image: np.ndarray uint8 2D
    """

    def __init__(
        self,
        det_model_path: Path = DET_MODEL_PATH,
        rec_model_path: Path = REC_MODEL_PATH,
        char_dict_path: Path = REC_CHAR_DICT_PATH,
    ) -> None:
        self._opts            = _build_session_options()
        self._providers       = ["CPUExecutionProvider"]
        self._det_session     = self._load_session(det_model_path, "Detection")
        self._rec_session     = self._load_session(rec_model_path, "Recognition")
        self._charset         = _load_charset(char_dict_path)
        self._det_input_name  = self._det_session.get_inputs()[0].name
        self._rec_input_name  = self._rec_session.get_inputs()[0].name

        logger.info(
            "[ONNXReceiptOCR] Initialized. "
            f"Det: {det_model_path.name}, "
            f"Rec: {rec_model_path.name}, "
            f"Charset size: {len(self._charset)}"
        )

    # ── Session loader ─────────────────────────────────────────────────────────

    def _load_session(self, model_path: Path, stage_name: str) -> ort.InferenceSession:
        """
        Load ONNX session dengan error handling eksplisit.
        Raises FileNotFoundError jika model tidak ditemukan.
        Raises RuntimeError jika ONNX gagal load (model corrupt / incompatible).
        """
        if not model_path.exists():
            raise FileNotFoundError(
                f"[OCR] Model {stage_name} tidak ditemukan: {model_path}\n"
                "Pastikan fine-tuning dan ekspor ONNX sudah selesai. "
                "Lihat panduan CLI di PADDLE_FINETUNE_GUIDE.md."
            )
        try:
            session = ort.InferenceSession(
                str(model_path),
                sess_options=self._opts,
                providers=self._providers,
            )
        except Exception as exc:
            raise RuntimeError(
                f"[OCR] Gagal load {stage_name} model dari {model_path}: {exc}"
            ) from exc

        logger.info(f"[OCR] {stage_name} model loaded: {model_path.name}")
        return session

    # ── Detection Stage ────────────────────────────────────────────────────────

    def _preprocess_det(
        self,
        gray: np.ndarray,
        limit_side_len: int = DET_LIMIT_SIDE_LEN,
    ) -> tuple[np.ndarray, int, int]:
        """
        Preprocessing untuk detektor PP-OCRv4.

        Steps:
          1. Grayscale → RGB 3-channel (model dilatih dengan input RGB)
          2. Resize: sisi terpanjang = limit_side_len, jaga aspek rasio,
             buat dimensi habis dibagi 32 (requirement stride jaringan)
          3. Normalisasi: mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]
          4. HWC → CHW → tambah batch dim: (1, 3, H, W) float32

        Returns:
            (input_tensor, orig_h, orig_w)
        """
        orig_h, orig_w = gray.shape[:2]

        # Convert ke 3-channel BGR→RGB (gray → replicate channel)
        rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)

        # Resize dengan batas limit_side_len
        ratio    = float(limit_side_len) / max(orig_h, orig_w)
        new_h    = max(32, int(orig_h * ratio))
        new_w    = max(32, int(orig_w * ratio))
        # Pastikan habis dibagi 32
        new_h    = (new_h + 31) // 32 * 32
        new_w    = (new_w + 31) // 32 * 32

        resized  = cv2.resize(rgb, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        img_f32  = resized.astype(np.float32) / 255.0

        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_f32 = (img_f32 - mean) / std

        # HWC (H, W, 3) → NCHW (1, 3, H, W)
        tensor = np.transpose(img_f32, (2, 0, 1))[np.newaxis, ...]
        return tensor.astype(np.float32), orig_h, orig_w

    def _run_detection(self, gray: np.ndarray) -> list[list[int]]:
        """
        Jalankan detektor, kembalikan list bboxes [x_min, y_min, x_max, y_max].
        Raises RuntimeError jika inferensi gagal.
        """
        tensor, orig_h, orig_w = self._preprocess_det(gray)

        try:
            outputs  = self._det_session.run(None, {self._det_input_name: tensor})
        except Exception as exc:
            raise RuntimeError(f"[OCR] Detection ONNX inference gagal: {exc}") from exc

        # Output shape: (1, 1, H_model, W_model) — probability map
        prob_map = outputs[0][0, 0]   # (H_model, W_model)
        return _db_postprocess(prob_map, orig_h, orig_w)

    # ── Recognition Stage ──────────────────────────────────────────────────────

    def _preprocess_rec_crops(
        self,
        gray: np.ndarray,
        bboxes: list[list[int]],
    ) -> list[np.ndarray]:
        """
        Crop dan resize setiap bbox untuk input recognizer.
        Target shape per crop: (1, 3, REC_IMG_H, REC_IMG_W) — sudah ternormalisasi.
        """
        tensors: list[np.ndarray] = []
        for bbox in bboxes:
            x_min, y_min, x_max, y_max = bbox
            crop = gray[y_min:y_max, x_min:x_max]

            if crop.size == 0:
                # Crop kosong — isi dengan array nol agar batch tetap konsisten
                tensors.append(np.zeros((1, 3, REC_IMG_H, REC_IMG_W), dtype=np.float32))
                continue

            # Resize crop: tinggi = REC_IMG_H, lebar proporsional (max REC_IMG_W)
            crop_h, crop_w = crop.shape[:2]
            target_w = min(REC_IMG_W, int(crop_w * REC_IMG_H / max(crop_h, 1)))
            target_w = max(1, target_w)
            resized  = cv2.resize(
                cv2.cvtColor(crop, cv2.COLOR_GRAY2RGB),
                (target_w, REC_IMG_H),
                interpolation=cv2.INTER_LINEAR,
            )

            # Pad kanan ke REC_IMG_W
            canvas = np.zeros((REC_IMG_H, REC_IMG_W, 3), dtype=np.float32)
            canvas[:, :target_w, :] = resized.astype(np.float32) / 255.0

            # Normalisasi
            mean = np.array([0.5, 0.5, 0.5], dtype=np.float32)
            std  = np.array([0.5, 0.5, 0.5], dtype=np.float32)
            canvas = (canvas - mean) / std

            # HWC → NCHW
            tensor = np.transpose(canvas, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
            tensors.append(tensor)

        return tensors

    def _run_recognition_batch(
        self,
        crop_tensors: list[np.ndarray],
    ) -> list[tuple[str, float]]:
        """
        Jalankan recognizer dalam batch.
        Raises RuntimeError jika inferensi gagal.
        Returns list of (text, confidence).
        """
        results: list[tuple[str, float]] = []

        # Proses dalam mini-batch
        for i in range(0, len(crop_tensors), REC_BATCH_SIZE):
            batch = crop_tensors[i : i + REC_BATCH_SIZE]
            batch_input = np.concatenate(batch, axis=0)  # (N, 3, H, W)

            try:
                outputs = self._rec_session.run(None, {self._rec_input_name: batch_input})
            except Exception as exc:
                raise RuntimeError(
                    f"[OCR] Recognition ONNX inference gagal pada batch {i}: {exc}"
                ) from exc

            # outputs[0] shape: (N, T, num_classes)
            logits_batch = outputs[0]
            for j in range(logits_batch.shape[0]):
                text, conf = _ctc_greedy_decode(logits_batch[j], self._charset)
                results.append((text, conf))

        return results

    # ── Public API ─────────────────────────────────────────────────────────────

    def recognize(
        self,
        gray: np.ndarray,
        min_confidence: float = MIN_CONFIDENCE,
    ) -> list[dict]:
        """
        Jalankan full two-stage OCR pada gambar grayscale.

        Args:
            gray           : np.ndarray uint8, shape (H, W) — WAJIB grayscale 2D.
            min_confidence : filter deteksi dengan confidence di bawah threshold.

        Returns:
            List[Dict] dengan keys:
              "text"       : str
              "bbox"       : List[int]  — [x_min, y_min, x_max, y_max]
              "y_center"   : float
              "confidence" : float
            Diurutkan ascending berdasarkan y_center.

        Raises:
            TypeError    : jika input bukan np.ndarray 2D uint8.
            RuntimeError : jika inferensi ONNX gagal (model error).
        """
        # ── Validasi input (Kontrak Tahap 1) ──────────────────────────────────
        if not isinstance(gray, np.ndarray):
            raise TypeError(
                f"[OCR] Input harus numpy.ndarray, dapat {type(gray).__name__}"
            )
        if gray.ndim != 2:
            raise TypeError(
                f"[OCR] Input harus 2D grayscale (H, W), dapat shape {gray.shape}. "
                "Konversi ke grayscale menggunakan cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)."
            )
        if gray.dtype != np.uint8:
            gray = np.clip(gray, 0, 255).astype(np.uint8)

        # ── Stage 1: Detection ─────────────────────────────────────────────────
        bboxes = self._run_detection(gray)

        if not bboxes:
            logger.warning("[OCR] Tidak ada teks terdeteksi.")
            return []

        # ── Stage 2: Recognition ───────────────────────────────────────────────
        crop_tensors = self._preprocess_rec_crops(gray, bboxes)
        rec_results  = self._run_recognition_batch(crop_tensors)

        # ── Assemble output (Kontrak Tahap 2) ─────────────────────────────────
        output: list[dict] = []
        for bbox, (text, conf) in zip(bboxes, rec_results):
            if conf < min_confidence:
                continue
            if not text.strip():
                continue

            x_min, y_min, x_max, y_max = bbox
            output.append({
                "text"       : text.strip(),
                "bbox"       : [int(x_min), int(y_min), int(x_max), int(y_max)],
                "y_center"   : float((y_min + y_max) / 2.0),
                "confidence" : round(float(conf), 4),
            })

        # Sort by y_center ascending (atas → bawah)
        output.sort(key=lambda x: x["y_center"])
        return output


# ═══════════════════════════════════════════════════════════════════════════════
# Module-level singleton dan fungsi publik
# (kompatibel dengan pipeline.py dan receipt_parser.py)
# ═══════════════════════════════════════════════════════════════════════════════

_ocr_instance: ONNXReceiptOCR | None = None


def _get_or_create_instance() -> ONNXReceiptOCR:
    """Lazy-init singleton ONNXReceiptOCR."""
    global _ocr_instance
    if _ocr_instance is None:
        _ocr_instance = ONNXReceiptOCR()
    return _ocr_instance


def run_ocr(
    img_source: Union[str, Path, np.ndarray],
    min_confidence: float = MIN_CONFIDENCE,
) -> list[dict]:
    """
    Fungsi publik utama: jalankan OCR pada gambar struk.

    Args:
        img_source     : Path ke file gambar (str/Path) ATAU np.ndarray.
                         Jika array, wajib 2D grayscale uint8.
                         Jika path, akan dibaca dan dikonversi ke grayscale.
        min_confidence : filter confidence minimum.

    Returns:
        List[Dict] sesuai Kontrak Tahap 2, diurutkan y_center ascending:
          [{"text": str, "bbox": List[int], "y_center": float, "confidence": float}, ...]

    Signature sengaja disederhanakan (hilang parameter 'engine') karena pipeline
    sekarang murni ONNX. Pipeline.py perlu update kecil pada pemanggilan run_ocr().
    """
    # ── Load gambar jika input adalah path ────────────────────────────────────
    if isinstance(img_source, (str, Path)):
        img_path = Path(img_source)
        if not img_path.exists():
            raise FileNotFoundError(f"[OCR] Gambar tidak ditemukan: {img_path}")
        bgr = cv2.imread(str(img_path))
        if bgr is None:
            raise ValueError(f"[OCR] Tidak bisa membaca gambar: {img_path}")
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    elif isinstance(img_source, np.ndarray):
        # Terima BGR (3-channel) atau grayscale (2D) — normalize ke 2D grayscale
        if img_source.ndim == 3 and img_source.shape[2] == 3:
            gray = cv2.cvtColor(img_source, cv2.COLOR_BGR2GRAY)
        elif img_source.ndim == 3 and img_source.shape[2] == 1:
            gray = img_source[:, :, 0]
        elif img_source.ndim == 2:
            gray = img_source
        else:
            raise TypeError(
                f"[OCR] Array shape tidak didukung: {img_source.shape}. "
                "Gunakan (H,W) atau (H,W,3)."
            )
        gray = gray.astype(np.uint8)
    else:
        raise TypeError(
            f"[OCR] img_source harus str, Path, atau np.ndarray. Dapat: {type(img_source)}"
        )

    ocr = _get_or_create_instance()
    return ocr.recognize(gray, min_confidence=min_confidence)


def ocr_to_lines(ocr_results: list[dict]) -> list[str]:
    """
    Adapter: konversi output run_ocr() ke List[str] untuk receipt_parser.py.
    Hanya mengambil key "text", filter kosong.
    Urutan dipertahankan (sudah diurutkan y_center oleh run_ocr).
    """
    return [r["text"] for r in ocr_results if r.get("text", "").strip()]


def get_ocr_engine() -> ONNXReceiptOCR:
    """
    Backward-compatible alias — pipeline.py memanggil get_ocr_engine().
    Returns singleton ONNXReceiptOCR.
    """
    return _get_or_create_instance()
