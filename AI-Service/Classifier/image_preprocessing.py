"""
image_preprocessing.py — Preprocessing gambar struk sebelum OCR

Pipeline:
    1. Load gambar (path / np.ndarray)
    2. Resize jika terlalu besar
    3. Denoise (bilateral filter)
    4. CLAHE untuk kontras lokal
    5. Grayscale
    6. Adaptive threshold (untuk debug/analisis)
    7. Optional deskew
    8. Return: BGR (untuk PaddleOCR) + gray + binary + skew angle
"""

from pathlib import Path
from typing import Union, Optional
import cv2
import numpy as np
 
 
def _estimate_skew_angle(gray: np.ndarray) -> float:
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180,
                             threshold=80,
                             minLineLength=100,
                             maxLineGap=10)
    if lines is None:
        return 0.0

    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 != x1:
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            # Hanya ambil garis yang mendekati horizontal
            if abs(angle) < 20:
                angles.append(angle)

    if not angles:
        return 0.0

    # Median lebih robust dari mean terhadap garis outlier
    return float(np.median(angles))
 
 
def _apply_deskew_gray(img_gray: np.ndarray, angle: float) -> np.ndarray:
    """Rotasi gambar grayscale sebesar angle derajat."""
    if abs(angle) < 0.3:
        return img_gray
    h, w = img_gray.shape[:2]
    M    = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    return cv2.warpAffine(img_gray, M, (w, h),
                          flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REPLICATE)
 
 
def preprocess_image(
    img_source   : Union[str, Path, np.ndarray],
    max_dim      : int   = 1600,
    deskew       : bool  = True,
    clahe_clip   : float = 2.0,
    sharpen_for_ocr: bool = False,   # PERUBAHAN: default False
) -> dict:
    """
    Preprocessing gambar struk untuk OCR.
 
    PERUBAHAN KUNCI v6:
        - Output 'ocr_input' adalah GRAYSCALE (bukan BGR)
        - Urutan: load → resize → denoise → CLAHE → gray → threshold → deskew
        - Sharpening opsional, default OFF
 
    Args:
        img_source     : path file atau np.ndarray (BGR / grayscale)
        max_dim        : batas dimensi terpanjang setelah resize (px)
        deskew         : aktifkan koreksi kemiringan
        clahe_clip     : clip limit CLAHE
        sharpen_for_ocr: aktifkan sharpening sebelum output ke OCR.
                         Aktifkan HANYA untuk foto buram / resolusi rendah.
 
    Returns:
        dict berisi:
            'ocr_input' : np.ndarray (H,W) uint8 GRAYSCALE — input ke OCR
            'bgr'       : np.ndarray (H,W,3) uint8 — untuk display/debug
            'gray'      : np.ndarray (H,W)   uint8 — sama dengan ocr_input (pre-sharpen)
            'binary'    : np.ndarray (H,W)   uint8 — untuk debug deskew
            'skew'      : float — sudut koreksi yang diterapkan (derajat)
    """
    # ── 1. Load ──────────────────────────────────────────────────────────────
    if isinstance(img_source, (str, Path)):
        img = cv2.imread(str(img_source), cv2.IMREAD_COLOR)
        if img is None:
            raise FileNotFoundError(f"Gambar tidak ditemukan: {img_source}")
    else:
        img = img_source.copy()
        if img.ndim == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
 
    # ── 2. Resize ─────────────────────────────────────────────────────────────
    h, w    = img.shape[:2]
    
    min_width = 640
    if w < min_width:
        scale = min_width / w
        img   = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    
    h, w    = img.shape[:2]
    tile_h = max(4, h // 50)
    tile_w = max(4, w // 50)
    
 
    # ── 3. Denoise DULU (sebelum apapun) ─────────────────────────────────────
    # PERUBAHAN: di v5 sharpen dilakukan SEBELUM denoise.
    # Ini memperkuat noise sebelum filter bekerja → artefak masuk OCR.
    # Sekarang: denoise adalah langkah pertama setelah resize.
    img = cv2.bilateralFilter(img, d=5, sigmaColor=20, sigmaSpace=20)
 
    # ── 4. CLAHE pada channel L ───────────────────────────────────────────────
    lab     = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe   = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(tile_w, tile_h))
    img     = cv2.cvtColor(cv2.merge([clahe.apply(l), a, b]), cv2.COLOR_LAB2BGR)
 
    # ── 5. Grayscale ──────────────────────────────────────────────────────────
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
 
    # ── 6. Adaptive Threshold untuk deskew detection ─────────────────────────
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=6,
    )
 
    # ── 7. Deskew — dijalankan pada gray, konsisten dengan binary ────────────
    # PERUBAHAN: di v5 deskew diterapkan ke BGR tapi angle dihitung dari
    # binary yang state-nya berbeda (sebelum deskew diterapkan ke BGR).
    # v6: semua operasi pada gray/binary yang sama pipeline-nya.
    skew_angle = 0.0
    if deskew:
        skew_angle = _estimate_skew_angle(gray)
        if abs(skew_angle) > 0.5:
            gray_rotated = _apply_deskew_gray(gray, skew_angle)
            # Validasi: hitung ulang variance
            bin_before = cv2.adaptiveThreshold(gray, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 6)
            bin_after  = cv2.adaptiveThreshold(gray_rotated, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 6)
            var_before = np.var(np.sum(bin_before, axis=1))
            var_after  = np.var(np.sum(bin_after,  axis=1))

            if var_after > var_before:
                gray = gray_rotated
                img  = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
                binary = bin_after
            else:
                skew_angle = 0.0   # anggap tidak ada koreksi
                binary = bin_before
    # ── 8. Optional sharpening — SETELAH semua processing ────────────────────
    # Diaktifkan hanya untuk foto buram. Struk termal umumnya tidak butuh ini.
    ocr_input = gray.copy()
    if sharpen_for_ocr:
        sharpen_kernel = np.array([[0, -1, 0],
                                   [-1, 5, -1],
                                   [0, -1, 0]], dtype=np.float32)
        ocr_input = cv2.filter2D(gray, -1, sharpen_kernel)
 
    return {
        "ocr_input" : ocr_input,   # GRAYSCALE — dikirim ke EasyOCR
        "bgr"       : img,         # BGR — untuk display
        "gray"      : gray,
        "binary"    : binary,
        "skew"      : skew_angle,
    }
