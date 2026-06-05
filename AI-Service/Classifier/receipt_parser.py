"""
receipt_parser.py — Parser struk belanja Indonesia
"""

import re
from typing import Optional

import config

# ── Keyword sets ──────────────────────────────────────────────────────────────
TOTAL_KEYWORDS   = {"total", "jumlah", "subtotal", "tagihan", "grand", "amount"}
PAYMENT_KEYWORDS = {"tunai", "cash", "bayar", "pay", "kembali", "change", "kembalian"}
SKIP_KEYWORDS    = {
    "diskon", "discount", "pajak", "tax", "ppn",
    "kasir", "telp", "npwp", "wifi", "member",
    "thank", "terima kasih", "struk", "item",
}
HEADER_KEYWORDS  = {"jl.", "jalan", "no.", "telp", "fax", "www.", "http", "npwp"}

MAX_PLAUSIBLE_TOTAL = config.MAX_PLAUSIBLE_TOTAL   

# ── Regex patterns ────────────────────────────────────────────────────────────
_PATTERN_QTY_X  = re.compile(r'^(.+?)\s+(\d{1,3})\s*[xX×]\s*([\d.,]+)\s+([\d.,]+)\s*$')
_PATTERN_4COL   = re.compile(r'^(.+?)\s+(\d{1,3})\s+(\d[\d.,]+)\s+(\d[\d.,]+)\s*$')
_PATTERN_2COL   = re.compile(r'^(.+?)\s{2,}(\d[\d.,]{2,})\s*$')
_PRICE_RE       = re.compile(r'\b(\d[\d.,]{3,})\b')
_PHONE_LIKE_RE  = re.compile(r'\b0\d{8,}\b')
_LONG_NUM_RE    = re.compile(r'\b\d{9,}\b')

# FIX Bug 2 — Fuzzy match OCR-tolerant untuk kata "total"
# Menangkap variasi OCR: T0TAL, TOT AL, t otal, t0tal, JUMLAH, TAGIHAN, dll.
_FUZZY_TOTAL_RE = re.compile(
    r'(?:'
    r't[\s]*[o0][\s]*t[\s]*[a@][\s]*[l1i]'   # total dan variasinya
    r'|jumlah'
    r'|tagihan'
    r'|grand[\s]*total'
    r'|sub[\s]*total'
    r'|amount'
    r')',
    re.IGNORECASE,
)

# ── Utilitas ──────────────────────────────────────────────────────────────────
def _has_price(line: str) -> bool:
    for m in _PRICE_RE.finditer(line):
        if m.end() < len(line) and line[m.end()] == '-':
            continue
        return True
    return False

def _strip_product_code(name: str) -> str:
    return re.sub(r'^[A-Za-z0-9]{2,8}-\s*', '', name).strip()

def _is_likely_phone_or_code(line: str) -> bool:
    return bool(_PHONE_LIKE_RE.search(line)) or bool(_LONG_NUM_RE.search(line))

def parse_number(raw: str) -> float:
    raw = raw.strip()
    raw = re.sub(r'\s+', '', raw)
    if re.match(r'^\d{1,3}(\.\d{3})+(,\d+)?$', raw):
        raw = raw.replace('.', '').replace(',', '.')
    elif re.match(r'^\d{1,3}(,\d{3})+$', raw):
        raw = raw.replace(',', '')
    else:
        raw = re.sub(r'[^\d.]', '', raw)
    try:
        return float(raw)
    except ValueError:
        return 0.0

def _filter_price_candidates(nums: list) -> list:
    result = []
    for n in nums:
        val = parse_number(n)
        if 100 <= val <= MAX_PLAUSIBLE_TOTAL:
            result.append(val)
    return result


# ── extract_total — FIX Bug 1 + Bug 2 ────────────────────────────────────────
def extract_total(lines: list) -> float:
    for i, line in enumerate(reversed(lines)):
        idx   = len(lines) - 1 - i
        lower = line.lower()

        if _is_likely_phone_or_code(line):
            continue
        if any(kw in lower for kw in PAYMENT_KEYWORDS):
            continue

        # FIX Bug 2: fuzzy regex sebagai primary check, keyword set sebagai fallback
        has_kw = bool(_FUZZY_TOTAL_RE.search(lower)) or any(kw in lower for kw in TOTAL_KEYWORDS)
        nums   = _PRICE_RE.findall(line)

        if has_kw and nums:
            candidates = _filter_price_candidates(nums)
            if candidates:
                val = max(candidates)
                if val <= MAX_PLAUSIBLE_TOTAL:   # FIX Bug 1
                    return val

        if has_kw and not nums:
            for j in range(1, 3):
                if idx + j < len(lines):
                    next_line = lines[idx + j]
                    if _is_likely_phone_or_code(next_line):
                        continue
                    next_nums  = _PRICE_RE.findall(next_line)
                    candidates = _filter_price_candidates(next_nums)
                    if candidates:
                        val = max(candidates)
                        if val <= MAX_PLAUSIBLE_TOTAL:   # FIX Bug 1
                            return val

    # Fallback: angka terbesar dari 5 baris terakhir
    for line in reversed(lines[-5:]):
        if _is_likely_phone_or_code(line):
            continue
        if any(kw in line.lower() for kw in PAYMENT_KEYWORDS):
            continue
        nums       = _PRICE_RE.findall(line)
        candidates = _filter_price_candidates(nums)
        if candidates:
            val = max(candidates)
            if val <= MAX_PLAUSIBLE_TOTAL:   # FIX Bug 1
                return val

    return 0.0


# ── Fungsi lain tidak berubah ─────────────────────────────────────────────────
def extract_merchant(lines: list) -> str:
    for line in lines[:6]:
        line = line.strip()
        if not line or len(line) < 3:
            continue
        lower = line.lower()
        if any(kw in lower for kw in HEADER_KEYWORDS | SKIP_KEYWORDS):
            continue
        if _has_price(line):
            continue
        if re.match(r'^[\d\s\W]+$', line):
            continue
        return line
    return ""

def parse_item_line(line: str) -> Optional[dict]:
    line = line.strip()
    if not line or len(line) < 3:
        return None
    lower = line.lower()
    if any(kw in lower for kw in TOTAL_KEYWORDS | SKIP_KEYWORDS | HEADER_KEYWORDS):
        return None
    if not _PRICE_RE.search(line):
        return None

    m = _PATTERN_QTY_X.match(line)
    if m:
        name       = m.group(1).strip()
        qty        = int(m.group(2))
        unit_price = parse_number(m.group(3))
        line_total = parse_number(m.group(4))
        if name and line_total > 0:
            return {"name": _strip_product_code(name), "qty": qty,
                    "unit_price": unit_price, "line_total": line_total}

    m = _PATTERN_4COL.match(line)
    if m:
        name       = m.group(1).strip()
        qty        = int(m.group(2))
        unit_price = parse_number(m.group(3))
        line_total = parse_number(m.group(4))
        if (name and line_total > 0 and qty > 0
                and abs(line_total - qty * unit_price) / max(line_total, 1) < 0.20):
            return {"name": _strip_product_code(name), "qty": qty,
                    "unit_price": unit_price, "line_total": line_total}

    m = _PATTERN_2COL.match(line)
    if m:
        name       = m.group(1).strip()
        line_total = parse_number(m.group(2))
        if name and line_total > 0 and len(name) >= 3:
            return {"name": _strip_product_code(name), "qty": 1,
                    "unit_price": line_total, "line_total": line_total}
    return None

def _preprocess_lines(lines: list) -> list:
    merged = []
    i = 0
    while i < len(lines):
        line  = lines[i].strip()
        lower = line.lower()
        is_text = not _has_price(line) and bool(re.search(r'[a-zA-Z]', line))
        is_skip = any(kw in lower for kw in TOTAL_KEYWORDS | SKIP_KEYWORDS)
        if is_text and not is_skip and i + 1 < len(lines) and len(line) < 20:
            nxt       = lines[i + 1].strip()
            nxt_lower = nxt.lower()
            nxt_text  = not _has_price(nxt) and bool(re.search(r'[a-zA-Z]', nxt))
            nxt_skip  = any(kw in nxt_lower for kw in TOTAL_KEYWORDS | SKIP_KEYWORDS)
            if nxt_text and not nxt_skip:
                merged.append(line + ' ' + nxt)
                i += 2
                continue
        merged.append(line)
        i += 1

    result = []
    i = 0
    while i < len(merged):
        line      = merged[i].strip()
        lower     = line.lower()
        has_price = _has_price(line)
        has_text  = bool(re.search(r'[a-zA-Z]', line))
        is_skip   = any(kw in lower for kw in TOTAL_KEYWORDS | SKIP_KEYWORDS)
        if has_text and not has_price and not is_skip and i + 1 < len(merged):
            nxt          = merged[i + 1].strip()
            nxt_nums     = _has_price(nxt.replace(' ', ''))
            nxt_only_num = bool(re.match(r'^[\d\s.,]+$', nxt)) and nxt_nums
            if nxt_only_num:
                result.append(line + '  ' + nxt.replace(' ', ''))
                i += 2
                continue
        result.append(line)
        i += 1
    return result

def parse_receipt(raw_lines: list) -> dict:
    lines         = [l.strip() for l in raw_lines if l.strip()]
    lines         = _preprocess_lines(lines)
    merchant      = extract_merchant(lines)
    total_expense = extract_total(lines)

    items = []
    for line in lines:
        item = parse_item_line(line)
        if item:
            items.append(item)

    deduped = {}
    for it in items:
        key = it["name"].lower()
        if key in deduped:
            deduped[key]["qty"]        += it["qty"]
            deduped[key]["line_total"] += it["line_total"]
        else:
            deduped[key] = dict(it)
    items = list(deduped.values())

    distinct_item_count = len(items)
    total_qty           = sum(it["qty"] for it in items)
    sum_items           = sum(it["line_total"] for it in items)

    if total_expense == 0.0 and sum_items > 0:
        total_expense = sum_items

    avg_item_price = (total_expense / distinct_item_count
                      if distinct_item_count > 0 else total_expense)

    if sum_items > 0 and total_expense > (sum_items * 3.0):
        total_expense = sum_items

    return {
        "merchant"           : merchant,
        "items"              : items,
        "total_expense"      : total_expense,
        "distinct_item_count": distinct_item_count,
        "total_qty"          : total_qty,
        "avg_item_price"     : avg_item_price,
        "raw_lines"          : lines,
    }


def extract_fields(raw_lines: list) -> dict:
    """
    FIX Bug 3: clf_text fallback diperluas ke seluruh raw_lines jika hasilnya < 10 char.
    FIX Bug 5: fallback eksplisit total ke sum(items) sebagai defense-in-depth.
    """
    receipt = parse_receipt(raw_lines)

    merchant  = receipt.get("merchant", "")
    item_text = " ".join(it["name"] for it in receipt["items"])
    combined  = f"{merchant} {item_text}".strip()

    if not combined or len(combined) < 3:
        combined = " ".join(receipt["raw_lines"][:5])

    clf_text = config.clean_text(combined)

    # FIX Bug 3: fallback ke semua baris jika clf_text hampir kosong setelah clean_text
    if len(clf_text.strip()) < 10:
        clf_text = config.clean_text(" ".join(receipt["raw_lines"]))

    # FIX Bug 5: defense-in-depth
    total = receipt["total_expense"]
    if total == 0.0:
        sum_items = sum(it["line_total"] for it in receipt["items"])
        if sum_items > 0:
            total = sum_items

    tab = config.build_tabular_features(
        total      = total,
        avg_price  = receipt["avg_item_price"],
        item_count = receipt["distinct_item_count"],
    ).tolist()

    # Debug — hapus setelah inferensi terkonfirmasi benar
    print(f"[extract_fields] clf_text  : {repr(clf_text[:80])}")
    print(f"[extract_fields] total     : {total:,.0f}")
    print(f"[extract_fields] tab_feats : {tab}")

    return {
        "items"              : receipt["items"],
        "distinct_item_count": receipt["distinct_item_count"],
        "total_qty"          : receipt["total_qty"],
        "total_expense"      : total,
        "avg_item_price"     : receipt["avg_item_price"],
        "clf_text"           : clf_text,
        "tab_features"       : tab,
        "raw_lines"          : receipt["raw_lines"],
    }
