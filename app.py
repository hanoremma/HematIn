import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Expense Analytics",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.stApp {
    background: #080b14;
    font-family: 'DM Sans', sans-serif;
}

[data-testid="stSidebar"] {
    background: #0d1120 !important;
    border-right: 1px solid rgba(99,179,237,0.12);
}

#MainMenu, header, footer { visibility: hidden; }

/* Metric cards */
[data-testid="metric-container"] {
    background: linear-gradient(135deg, #0d1120 0%, #111827 100%);
    border: 1px solid rgba(99,179,237,0.15);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
}
[data-testid="metric-container"]:hover {
    border-color: rgba(99,179,237,0.35);
}
[data-testid="stMetricValue"] {
    color: #e2e8f0;
    font-size: 1.7rem !important;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
}
[data-testid="stMetricLabel"] {
    color: #4a9eca;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
[data-testid="stMetricDelta"] { font-size: 0.8rem; }

/* Chart containers */
.chart-card {
    background: #0d1120;
    border: 1px solid rgba(99,179,237,0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
}
.chart-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
}
.chart-subtitle {
    font-size: 0.78rem;
    color: #475569;
    margin-bottom: 12px;
}

/* Warning banner */
.warning-banner {
    background: linear-gradient(90deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.03) 100%);
    border: 1px solid rgba(251,191,36,0.3);
    border-left: 4px solid #fbbf24;
    border-radius: 10px;
    padding: 12px 18px;
    margin: 12px 0 20px 0;
    font-size: 0.82rem;
    color: #fbbf24;
}

/* Insight cards */
.insight-card {
    background: #0d1120;
    border: 1px solid rgba(99,179,237,0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 14px;
    border-left: 4px solid;
    transition: transform 0.2s, box-shadow 0.2s;
}
.insight-card:hover {
    transform: translateX(4px);
}
.ins-tag {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 3px 10px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 10px;
    font-family: 'Space Mono', monospace;
}
.ins-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 6px;
}
.ins-num {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    margin: 6px 0;
}
.ins-body {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.65;
}

/* Page title */
.page-title {
    font-family: 'Space Mono', monospace;
    font-size: 1.6rem;
    font-weight: 700;
    color: #e2e8f0;
    letter-spacing: -0.02em;
    margin-bottom: 2px;
}
.page-sub {
    font-size: 0.82rem;
    color: #475569;
    margin-bottom: 20px;
}

/* Sidebar nav */
.nav-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #4a9eca;
    margin: 20px 0 8px 0;
}

/* KPI row glow */
.kpi-accent {
    font-family: 'Space Mono', monospace;
    font-size: 2rem;
    font-weight: 700;
    color: #63b3ed;
    line-height: 1;
}

/* Table styling */
[data-testid="stDataFrame"] {
    border-radius: 12px;
    overflow: hidden;
}

/* Selectbox / multiselect */
[data-testid="stSelectbox"] > div, 
[data-testid="stMultiSelect"] > div {
    background: #111827 !important;
}

/* Forecast badge */
.forecast-badge {
    display: inline-block;
    background: rgba(168,85,247,0.15);
    border: 1px solid rgba(168,85,247,0.4);
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 0.7rem;
    color: #c084fc;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-left: 8px;
}

/* YoY badge */
.badge-up { color: #f87171; }
.badge-dn { color: #34d399; }
</style>
""", unsafe_allow_html=True)

# ── Plotly theme ───────────────────────────────────────────────────────────────
BG = "#0d1120"
GRID = "rgba(99,179,237,0.06)"
TEXT = "#64748b"
AXIS = "rgba(99,179,237,0.15)"

def plotly_layout(**kw):
    base = dict(
        paper_bgcolor=BG, plot_bgcolor=BG,
        font=dict(color=TEXT, family="DM Sans", size=11),
        margin=dict(l=10, r=10, t=36, b=10),
        xaxis=dict(gridcolor=GRID, linecolor=AXIS, zerolinecolor=GRID),
        yaxis=dict(gridcolor=GRID, linecolor=AXIS, zerolinecolor=GRID),
        legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color="#94a3b8", size=10)),
    )
    base.update(kw)
    return base

CAT_COLORS = {
    "Lain-lain":        "#63b3ed",
    "Tagihan/Utilitas": "#f87171",
    "Transportasi":     "#34d399",
    "Belanja":          "#fbbf24",
    "Makanan/Minuman":  "#c084fc",
    "Kesehatan":        "#38bdf8",
    "Pendidikan":       "#fb923c",
    "Investasi":        "#4ade80",
    "Hiburan":          "#e879f9",
    "Keuangan":         "#a78bfa",
}
ACCENT = "#63b3ed"

# ── Load data ──────────────────────────────────────────────────────────────────
@st.cache_data
def load_data():
    df = pd.read_csv("pengeluaran_clean.csv", parse_dates=["tanggal_transaksi"])
    df["tahun"]   = df["tanggal_transaksi"].dt.year
    df["bulan"]   = df["tanggal_transaksi"].dt.to_period("M").astype(str)
    df["bulan_n"] = df["tanggal_transaksi"].dt.month
    df["hari"]    = df["tanggal_transaksi"].dt.day_name()
    df["kuartal"] = df["tanggal_transaksi"].dt.to_period("Q").astype(str)
    df["minggu"]  = df["tanggal_transaksi"].dt.isocalendar().week.astype(int)
    return df

df = load_data()

# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown('<div class="page-title" style="font-size:1.1rem">💰 Expense<br>Analytics</div>', unsafe_allow_html=True)
    st.markdown('<div style="font-size:0.7rem;color:#475569;margin-bottom:16px;font-family:Space Mono">v2.0 · 2015–2024</div>', unsafe_allow_html=True)
    st.markdown("---")

    st.markdown('<div class="nav-label">Navigasi</div>', unsafe_allow_html=True)
    halaman = st.radio(
        "nav",
        ["📊 Dashboard", "📈 Tren & Musiman", "🗂️ Per Kategori", "🔮 Forecasting", "💡 Insight"],
        label_visibility="collapsed",
    )
    st.markdown("---")

    st.markdown('<div class="nav-label">Filter Global</div>', unsafe_allow_html=True)
    all_years = sorted(df["tahun"].unique())
    tahun_dipilih = st.multiselect("Tahun", all_years, default=all_years)
    all_kat = sorted(df["kategori"].unique())
    kat_dipilih = st.multiselect("Kategori", all_kat, default=all_kat)

    # Range slider
    min_val = int(df["total_pengeluaran"].min())
    max_val = int(df["total_pengeluaran"].max())
    rng = st.slider("Rentang Nilai Transaksi", min_val, min(max_val, 2000000),
                    (min_val, min(max_val, 2000000)), step=10000,
                    format="Rp %d")

    st.markdown("---")
    st.markdown('<div class="nav-label">Catatan Data</div>', unsafe_allow_html=True)
    st.markdown("""
    <div class="warning-banner">
        ⚠️ <strong>2019 & 2020 tidak ada data.</strong><br>
        Kemungkinan terjadi perpindahan tempat tinggal atau perubahan metode pencatatan pada periode tersebut.
    </div>
    """, unsafe_allow_html=True)
    st.caption(f"📁 **{len(df):,}** transaksi total")
    st.caption(f"📅 {df['tanggal_transaksi'].min().date()} → {df['tanggal_transaksi'].max().date()}")

# Apply global filter
dff = df[
    df["tahun"].isin(tahun_dipilih) &
    df["kategori"].isin(kat_dipilih) &
    (df["total_pengeluaran"] >= rng[0]) &
    (df["total_pengeluaran"] <= rng[1])
]

# Helper
def fmt_rp(n):
    if n >= 1e9:  return f"Rp {n/1e9:.2f} M"
    if n >= 1e6:  return f"Rp {n/1e6:.1f} Jt"
    if n >= 1e3:  return f"Rp {n/1e3:.0f} Rb"
    return f"Rp {n:.0f}"

def pct_delta(new, old):
    if old == 0: return 0
    return round((new - old) / old * 100, 1)

# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
if halaman == "📊 Dashboard":
    st.markdown('<div class="page-title">📊 Dashboard Pengeluaran</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-sub">Gambaran menyeluruh seluruh periode · Gunakan filter di sidebar untuk eksplorasi</div>', unsafe_allow_html=True)

    # Warning banner on main page
    st.markdown("""
    <div class="warning-banner" style="margin-top:0">
        ⚠️ <strong>Catatan:</strong> Data tahun 2019 dan 2020 tidak tersedia dalam catatan ini.
        Gap ini terlihat pada grafik timeline dan bukan merupakan error visualisasi.
    </div>
    """, unsafe_allow_html=True)

    # ── KPI Row ──
    total       = dff["total_pengeluaran"].sum()
    n_tx        = len(dff)
    n_bulan     = dff["bulan"].nunique()
    avg_bln     = dff.groupby("bulan")["total_pengeluaran"].sum().mean() if n_bulan else 0
    avg_tx      = dff["total_pengeluaran"].mean() if n_tx else 0
    yr_max      = dff.groupby("tahun")["total_pengeluaran"].sum()
    tahun_boros = yr_max.idxmax() if len(yr_max) else "-"
    yr_max_val  = yr_max.max() if len(yr_max) else 0

    # Compare last two available years
    yrs = sorted(dff["tahun"].unique())
    delta_str = ""
    if len(yrs) >= 2:
        t1 = dff[dff["tahun"]==yrs[-1]]["total_pengeluaran"].sum()
        t0 = dff[dff["tahun"]==yrs[-2]]["total_pengeluaran"].sum()
        pct = pct_delta(t1, t0)
        delta_str = f"{pct:+.1f}% vs {yrs[-2]}"

    c1, c2, c3, c4, c5, c6 = st.columns(6)
    c1.metric("Total Pengeluaran",     fmt_rp(total))
    c2.metric("Jumlah Transaksi",      f"{n_tx:,}")
    c3.metric("Rata-rata/Bulan",       fmt_rp(avg_bln))
    c4.metric("Rata-rata/Transaksi",   fmt_rp(avg_tx))
    c5.metric("Tahun Paling Boros",    str(tahun_boros), delta=fmt_rp(yr_max_val))
    c6.metric(f"Pertumbuhan {yrs[-1] if yrs else ''}", delta_str if delta_str else "-")

    st.markdown("---")

    # ── Row 1: Yearly bar + Pie ──
    col_a, col_b = st.columns([3, 2])

    with col_a:
        st.markdown('<div class="chart-title">Total Pengeluaran per Tahun</div>', unsafe_allow_html=True)
        st.markdown('<div class="chart-subtitle">Tahun 2019 & 2020 tidak ada data</div>', unsafe_allow_html=True)

        by_year = dff.groupby("tahun").agg(
            total=("total_pengeluaran","sum"),
            count=("total_pengeluaran","count")
        ).reset_index()
        max_v = by_year["total"].max()
        by_year["color"] = by_year["total"].apply(lambda v: "#f87171" if v == max_v else ACCENT)

        # Add gap annotation
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=by_year["tahun"].astype(str), y=by_year["total"]/1e6,
            marker_color=by_year["color"],
            text=(by_year["total"]/1e6).round(1).astype(str)+" Jt",
            textposition="outside",
            textfont=dict(color="#94a3b8", size=10),
            customdata=by_year["count"],
            hovertemplate="<b>%{x}</b><br>Total: Rp %{y:.2f} Jt<br>Transaksi: %{customdata:,}<extra></extra>",
        ))
        # Gap annotation
        fig.add_annotation(
            x="2018", y=by_year["total"].max()/1e6 * 0.85,
            xshift=60, text="⚠️ 2019–2020<br>No Data",
            showarrow=True, arrowhead=2, arrowcolor="#fbbf24",
            font=dict(color="#fbbf24", size=10),
            bordercolor="#fbbf24", borderwidth=1, borderpad=4,
            bgcolor="rgba(251,191,36,0.1)",
        )
        fig.update_layout(**plotly_layout(height=320, bargap=0.22,
            yaxis_title="Juta Rupiah", xaxis_title=""))
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown('<div class="chart-title">Komposisi Kategori</div>', unsafe_allow_html=True)
        st.markdown('<div class="chart-subtitle">Proporsi seluruh periode terpilih</div>', unsafe_allow_html=True)

        by_kat = dff.groupby("kategori")["total_pengeluaran"].sum().reset_index()
        colors = [CAT_COLORS.get(k, "#888") for k in by_kat["kategori"]]
        fig2 = go.Figure(go.Pie(
            labels=by_kat["kategori"], values=by_kat["total_pengeluaran"],
            hole=0.62, marker_colors=colors, textinfo="percent",
            textfont=dict(size=10),
            hovertemplate="<b>%{label}</b><br>Total: Rp %{value:,.0f}<br>%{percent}<extra></extra>",
        ))
        fig2.update_layout(**plotly_layout(height=320,
            legend=dict(bgcolor="rgba(0,0,0,0)", orientation="v", x=1.02, y=0.5, font=dict(size=10))))
        st.plotly_chart(fig2, use_container_width=True)

    # ── Row 2: DOW + Quarterly ──
    col_c, col_d = st.columns(2)

    with col_c:
        st.markdown('<div class="chart-title">Distribusi Hari dalam Seminggu</div>', unsafe_allow_html=True)
        dow_order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        dow_id    = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"]
        by_dow = dff.groupby("hari")["total_pengeluaran"].sum().reindex(dow_order).reset_index()
        by_dow["hari_id"] = dow_id
        by_dow["count"] = dff.groupby("hari").size().reindex(dow_order).values
        max_d = by_dow["total_pengeluaran"].max()
        colors_d = [("#fbbf24" if v == max_d else "#475569") for v in by_dow["total_pengeluaran"]]
        fig3 = go.Figure()
        fig3.add_trace(go.Bar(
            x=by_dow["hari_id"], y=by_dow["total_pengeluaran"]/1e6,
            marker_color=colors_d,
            hovertemplate="<b>%{x}</b><br>Total: Rp %{y:.1f} Jt<extra></extra>",
        ))
        fig3.update_layout(**plotly_layout(height=240, bargap=0.3,
            yaxis_title="Juta Rupiah"))
        st.plotly_chart(fig3, use_container_width=True)

    with col_d:
        st.markdown('<div class="chart-title">Total per Kuartal (Semua Tahun)</div>', unsafe_allow_html=True)
        by_q = dff.groupby("kuartal")["total_pengeluaran"].sum().reset_index()
        by_q = by_q.sort_values("kuartal")
        fig4 = go.Figure(go.Scatter(
            x=by_q["kuartal"], y=by_q["total_pengeluaran"]/1e6,
            mode="lines+markers",
            line=dict(color=ACCENT, width=2),
            marker=dict(size=6, color=ACCENT),
            fill="tozeroy", fillcolor=f"rgba(99,179,237,0.07)",
            hovertemplate="<b>%{x}</b><br>Rp %{y:.1f} Jt<extra></extra>",
        ))
        fig4.update_layout(**plotly_layout(height=240,
            yaxis_title="Juta Rupiah",
            xaxis=dict(tickangle=-45, nticks=15)))
        st.plotly_chart(fig4, use_container_width=True)

    # ── Row 3: YoY category change ──
    st.markdown("---")
    st.markdown('<div class="chart-title">Perubahan Pengeluaran per Kategori: Tahun Terakhir vs Sebelumnya</div>', unsafe_allow_html=True)

    avail_yrs = sorted(dff["tahun"].unique())
    if len(avail_yrs) >= 2:
        yr_last = avail_yrs[-1]
        yr_prev = avail_yrs[-2]
        k1 = dff[dff["tahun"]==yr_last].groupby("kategori")["total_pengeluaran"].sum()
        k0 = dff[dff["tahun"]==yr_prev].groupby("kategori")["total_pengeluaran"].sum()
        yoy = pd.DataFrame({"curr":k1,"prev":k0}).fillna(0).reset_index()
        yoy["pct"] = ((yoy["curr"]-yoy["prev"])/yoy["prev"]*100).round(1)
        yoy = yoy.sort_values("pct", ascending=True)
        bar_colors = ["#f87171" if p > 0 else "#34d399" for p in yoy["pct"]]

        fig5 = go.Figure(go.Bar(
            x=yoy["pct"], y=yoy["kategori"],
            orientation="h",
            marker_color=bar_colors,
            text=yoy["pct"].apply(lambda v: f"{v:+.1f}%"),
            textposition="outside",
            textfont=dict(size=10, color="#94a3b8"),
            hovertemplate="<b>%{y}</b><br>%{x:+.1f}%<extra></extra>",
        ))
        fig5.add_vline(x=0, line_color=AXIS, line_width=1)
        fig5.update_layout(**plotly_layout(height=300,
            xaxis_title=f"Perubahan % ({yr_prev} → {yr_last})",
            margin=dict(l=10, r=80, t=20, b=10)))
        st.plotly_chart(fig5, use_container_width=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — TREN & MUSIMAN
# ═══════════════════════════════════════════════════════════════════════════════
elif halaman == "📈 Tren & Musiman":
    st.markdown('<div class="page-title">📈 Tren & Pola Musiman</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-sub">Analisis tren bulanan, musiman, dan pola waktu transaksi</div>', unsafe_allow_html=True)

    # Year selector
    col_x, col_y = st.columns([2, 5])
    with col_x:
        yr_sel = st.selectbox("Fokus Tahun", sorted(dff["tahun"].unique(), reverse=True))
    dft = dff[dff["tahun"] == yr_sel]

    # KPIs
    t_total = dft["total_pengeluaran"].sum()
    t_count = len(dft)
    bln_data = dft.groupby("bulan")["total_pengeluaran"].sum()
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric(f"Total {yr_sel}", fmt_rp(t_total))
    c2.metric("Transaksi", f"{t_count:,}")
    if len(bln_data):
        c3.metric("Bulan Tertinggi", bln_data.idxmax()[-2:], fmt_rp(bln_data.max()))
        c4.metric("Bulan Terendah", bln_data.idxmin()[-2:], fmt_rp(bln_data.min()))
    c5.metric("Avg/Transaksi", fmt_rp(dft["total_pengeluaran"].mean()))

    st.markdown("---")

    # ── Main line chart with rolling avg ──
    st.markdown('<div class="chart-title">Tren Bulanan + Moving Average 3 Bulan</div>', unsafe_allow_html=True)
    bln_all = dff.groupby("bulan")["total_pengeluaran"].sum().reset_index()
    bln_all.columns = ["bulan","total"]
    bln_all = bln_all.sort_values("bulan")
    bln_all["ma3"] = bln_all["total"].rolling(3, center=True).mean()

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=bln_all["bulan"], y=bln_all["total"]/1e6,
        mode="lines", name="Bulanan",
        line=dict(color=f"rgba(99,179,237,0.4)", width=1.5),
        fill="tozeroy", fillcolor="rgba(99,179,237,0.05)",
    ))
    fig.add_trace(go.Scatter(
        x=bln_all["bulan"], y=bln_all["ma3"]/1e6,
        mode="lines", name="MA-3",
        line=dict(color="#fbbf24", width=2.5),
    ))
    # Gap annotation
    fig.add_vrect(x0="2018-12", x1="2021-01",
        fillcolor="rgba(251,191,36,0.04)", layer="below", line_width=0)
    fig.add_annotation(x="2019-06", y=bln_all["total"].max()/1e6 * 0.7,
        text="⚠️ 2019–2020<br>No Data",
        showarrow=False,
        font=dict(color="#fbbf24", size=10),
        bordercolor="#fbbf24", borderwidth=1, borderpad=5,
        bgcolor="rgba(251,191,36,0.08)")
    fig.update_layout(**plotly_layout(height=280, yaxis_title="Juta Rupiah",
        xaxis=dict(nticks=20, tickangle=-45)))
    st.plotly_chart(fig, use_container_width=True)

    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown('<div class="chart-title">Stacked Kategori per Bulan</div>', unsafe_allow_html=True)
        pivot = dft.groupby(["bulan","kategori"])["total_pengeluaran"].sum().unstack(fill_value=0)
        fig2 = go.Figure()
        for kat in pivot.columns:
            fig2.add_trace(go.Bar(
                name=kat, x=pivot.index, y=pivot[kat]/1e6,
                marker_color=CAT_COLORS.get(kat,"#888"),
                hovertemplate=f"<b>{kat}</b><br>%{{x}}<br>Rp %{{y:.2f}} Jt<extra></extra>",
            ))
        fig2.update_layout(**plotly_layout(height=300, barmode="stack",
            yaxis_title="Juta Rupiah"))
        st.plotly_chart(fig2, use_container_width=True)

    with col_b:
        st.markdown('<div class="chart-title">Pola Musiman — Rata-rata per Bulan Kalender</div>', unsafe_allow_html=True)
        seasonal = dff.groupby("bulan_n")["total_pengeluaran"].mean().reset_index()
        seasonal.columns = ["bulan_n","avg"]
        month_names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"]
        seasonal["nama"] = seasonal["bulan_n"].apply(lambda x: month_names[x-1])
        max_s = seasonal["avg"].max()
        colors_s = ["#c084fc" if v == max_s else f"rgba(99,179,237,0.6)" for v in seasonal["avg"]]
        fig3 = go.Figure(go.Bar(
            x=seasonal["nama"], y=seasonal["avg"]/1e3,
            marker_color=colors_s,
            text=(seasonal["avg"]/1e3).round(0).astype(int).astype(str)+" Rb",
            textposition="outside", textfont=dict(size=9, color="#94a3b8"),
        ))
        fig3.update_layout(**plotly_layout(height=300,
            yaxis_title="Rata-rata (Ribu Rp)", bargap=0.25))
        st.plotly_chart(fig3, use_container_width=True)

    # ── Heatmap: tahun × bulan ──
    st.markdown("---")
    st.markdown('<div class="chart-title">Heatmap Pengeluaran: Tahun × Bulan Kalender</div>', unsafe_allow_html=True)
    st.markdown('<div class="chart-subtitle">Sel kosong di 2019–2020 = tidak ada data</div>', unsafe_allow_html=True)

    heat_data = dff.groupby(["tahun","bulan_n"])["total_pengeluaran"].sum().unstack(fill_value=0)
    month_names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"]

    fig4 = go.Figure(go.Heatmap(
        z=heat_data.values/1e6,
        x=month_names,
        y=heat_data.index.astype(str).tolist(),
        colorscale=[[0,"#0d1120"],[0.3,"#1e3a5f"],[0.7,"#2563eb"],[1,"#63b3ed"]],
        colorbar=dict(title="Juta Rp", tickfont=dict(color="#94a3b8")),
        text=[[f"{v:.1f}" if v > 0 else "" for v in row] for row in heat_data.values/1e6],
        texttemplate="%{text}",
        textfont=dict(size=9),
        hovertemplate="<b>%{y} – %{x}</b><br>Rp %{z:.2f} Jt<extra></extra>",
    ))
    fig4.update_layout(**plotly_layout(height=320,
        xaxis=dict(tickangle=0),
        margin=dict(l=10, r=10, t=20, b=10)))
    st.plotly_chart(fig4, use_container_width=True)

    # ── Frekuensi transaksi ──
    st.markdown('<div class="chart-title">Frekuensi Transaksi per Bulan</div>', unsafe_allow_html=True)
    freq = dft.groupby("bulan").size().reset_index(name="n")
    fig5 = go.Figure(go.Bar(
        x=freq["bulan"], y=freq["n"],
        marker_color="#34d399",
        text=freq["n"], textposition="outside",
        textfont=dict(size=10, color="#94a3b8"),
    ))
    fig5.update_layout(**plotly_layout(height=220, yaxis_title="Jumlah Transaksi", bargap=0.3))
    st.plotly_chart(fig5, use_container_width=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — PER KATEGORI
# ═══════════════════════════════════════════════════════════════════════════════
elif halaman == "🗂️ Per Kategori":
    st.markdown('<div class="page-title">🗂️ Analisis Per Kategori</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-sub">Drill-down mendalam per kategori pengeluaran</div>', unsafe_allow_html=True)

    # Category selector
    kat_focus = st.selectbox("Fokus Kategori (untuk detail bawah)", sorted(dff["kategori"].unique()))

    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown('<div class="chart-title">Total per Kategori</div>', unsafe_allow_html=True)
        by_kat = dff.groupby("kategori").agg(
            total=("total_pengeluaran","sum"),
            count=("total_pengeluaran","count"),
            avg=("total_pengeluaran","mean"),
        ).sort_values("total", ascending=True).reset_index()
        colors_k = [CAT_COLORS.get(k,"#888") for k in by_kat["kategori"]]
        fig = go.Figure(go.Bar(
            x=by_kat["total"]/1e6, y=by_kat["kategori"],
            orientation="h", marker_color=colors_k,
            text=(by_kat["total"]/1e6).round(1).astype(str)+" Jt",
            textposition="outside", textfont=dict(size=10, color="#94a3b8"),
            customdata=np.stack([by_kat["count"], by_kat["avg"]/1e3], axis=-1),
            hovertemplate="<b>%{y}</b><br>Total: Rp %{x:.1f} Jt<br>Transaksi: %{customdata[0]:,}<br>Avg: Rp %{customdata[1]:.0f} Rb<extra></extra>",
        ))
        fig.update_layout(**plotly_layout(height=360, xaxis_title="Juta Rupiah",
            margin=dict(l=0,r=80,t=20,b=10)))
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        st.markdown('<div class="chart-title">Evolusi Kategori per Tahun (Line)</div>', unsafe_allow_html=True)
        top_cats = dff.groupby("kategori")["total_pengeluaran"].sum().nlargest(6).index.tolist()
        pivot_cat = dff[dff["kategori"].isin(top_cats)].groupby(["tahun","kategori"])["total_pengeluaran"].sum().unstack(fill_value=0)
        fig2 = go.Figure()
        for kat in top_cats:
            if kat in pivot_cat.columns:
                fig2.add_trace(go.Scatter(
                    x=pivot_cat.index.astype(str), y=pivot_cat[kat]/1e6,
                    mode="lines+markers", name=kat,
                    line=dict(color=CAT_COLORS.get(kat,"#888"), width=2),
                    marker=dict(size=8),
                    hovertemplate=f"<b>{kat}</b><br>%{{x}}<br>Rp %{{y:.2f}} Jt<extra></extra>",
                ))
        # gap annotation
        fig2.add_vrect(x0="2018", x1="2021",
            fillcolor="rgba(251,191,36,0.04)", layer="below", line_width=0)
        fig2.add_annotation(x="2019", y=0,
            text="⚠️ no data", showarrow=False,
            font=dict(color="#fbbf24", size=9), textangle=-90,
            xanchor="center")
        fig2.update_layout(**plotly_layout(height=360, yaxis_title="Juta Rupiah",
            legend=dict(orientation="h", y=-0.25, font=dict(size=10))))
        st.plotly_chart(fig2, use_container_width=True)

    st.markdown("---")
    col_c, col_d = st.columns(2)

    with col_c:
        st.markdown('<div class="chart-title">Heatmap Kategori × Tahun</div>', unsafe_allow_html=True)
        heat = dff.groupby(["tahun","kategori"])["total_pengeluaran"].sum().unstack(fill_value=0)
        fig3 = go.Figure(go.Heatmap(
            z=heat.values/1e6,
            x=heat.columns.tolist(),
            y=heat.index.astype(str).tolist(),
            colorscale=[[0,"#0d1120"],[0.4,"#1d4ed8"],[1,"#63b3ed"]],
            colorbar=dict(title="Juta Rp", tickfont=dict(color="#94a3b8")),
            text=[[f"{v:.0f}" if v > 0 else "" for v in row] for row in heat.values/1e6],
            texttemplate="%{text}",
            textfont=dict(size=9),
        ))
        fig3.update_layout(**plotly_layout(height=320,
            xaxis=dict(tickangle=-40), margin=dict(l=10,r=10,t=20,b=80)))
        st.plotly_chart(fig3, use_container_width=True)

    with col_d:
        st.markdown(f'<div class="chart-title">Tren Bulanan: {kat_focus}</div>', unsafe_allow_html=True)
        df_kat = dff[dff["kategori"]==kat_focus].groupby("bulan")["total_pengeluaran"].sum().reset_index()
        df_kat.columns = ["bulan","total"]
        df_kat = df_kat.sort_values("bulan")
        fig4 = go.Figure()
        fig4.add_trace(go.Scatter(
            x=df_kat["bulan"], y=df_kat["total"]/1e6,
            mode="lines+markers",
            line=dict(color=CAT_COLORS.get(kat_focus,"#888"), width=2.5),
            marker=dict(size=7),
            fill="tozeroy",
            fillcolor=f"rgba(99,179,237,0.06)",
        ))
        fig4.update_layout(**plotly_layout(height=320, yaxis_title="Juta Rupiah",
            xaxis=dict(tickangle=-45, nticks=15)))
        st.plotly_chart(fig4, use_container_width=True)

    # Top products
    st.markdown("---")
    st.markdown(f'<div class="chart-title">Top 20 Produk: {kat_focus}</div>', unsafe_allow_html=True)
    top_p = dff[dff["kategori"]==kat_focus].groupby("nama_produk")["total_pengeluaran"].sum().sort_values(ascending=False).head(20).reset_index()
    top_p["nama_produk"] = top_p["nama_produk"].str.title().str[:40]
    fig5 = go.Figure(go.Bar(
        x=top_p["total_pengeluaran"]/1e6,
        y=top_p["nama_produk"],
        orientation="h",
        marker_color=CAT_COLORS.get(kat_focus,"#63b3ed"),
        text=(top_p["total_pengeluaran"]/1e6).round(2).astype(str)+" Jt",
        textposition="outside", textfont=dict(size=9, color="#94a3b8"),
    ))
    fig5.update_layout(**plotly_layout(height=500, xaxis_title="Juta Rupiah",
        margin=dict(l=0,r=80,t=20,b=10),
        yaxis=dict(autorange="reversed")))
    st.plotly_chart(fig5, use_container_width=True)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — FORECASTING
# ═══════════════════════════════════════════════════════════════════════════════
elif halaman == "🔮 Forecasting":
    st.markdown('<div class="page-title">🔮 Analisis Prediksi</div>', unsafe_allow_html=True)
    st.markdown("""
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="font-size:0.82rem;color:#475569">Proyeksi berbasis tren historis & pola musiman</span>
        <span class="forecast-badge">EKSPERIMENTAL</span>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="warning-banner">
        ⚠️ <strong>Catatan Penting:</strong> Tahun 2019 & 2020 tidak ada data. Forecasting menggunakan data 2021–2024
        sebagai baseline dan mengabaikan gap tersebut. Prediksi bersifat indikatif, bukan aktuaria.
    </div>
    """, unsafe_allow_html=True)

    # ── Forecast method selection ──
    col_opt, _ = st.columns([2,3])
    with col_opt:
        method = st.selectbox("Metode Forecasting",
            ["Rata-rata Bergerak (MA)", "Regresi Linear", "Seasonal Decomposition"])
        horizon = st.slider("Horizon Prediksi (bulan)", 3, 24, 12)

    # Prepare monthly series (2021-2024 only — post gap)
    monthly_full = dff.groupby("bulan")["total_pengeluaran"].sum().reset_index()
    monthly_full.columns = ["bulan","total"]
    monthly_full = monthly_full.sort_values("bulan").reset_index(drop=True)
    monthly_full["bulan_dt"] = pd.to_datetime(monthly_full["bulan"])

    recent_monthly = monthly_full[monthly_full["bulan_dt"] >= "2021-01-01"].copy().reset_index(drop=True)
    recent_monthly["t"] = np.arange(len(recent_monthly))

    # Compute forecast
    last_date = recent_monthly["bulan_dt"].max()
    future_dates = pd.date_range(
        start=last_date + pd.DateOffset(months=1),
        periods=horizon, freq="MS"
    )
    future_str = future_dates.to_period("M").astype(str).tolist()

    if method == "Regresi Linear":
        from numpy.polynomial import polynomial as P
        t = recent_monthly["t"].values
        y = recent_monthly["total"].values
        coeffs = np.polyfit(t, y, 1)
        t_future = np.arange(len(t), len(t) + horizon)
        forecast_vals = np.polyval(coeffs, t_future)
        method_note = "Regresi linear OLS pada data 2021–2024"

    elif method == "Rata-rata Bergerak (MA)":
        window = 6
        last_vals = recent_monthly["total"].tail(window).values
        avg = last_vals.mean()
        # trend from last 12 months
        if len(recent_monthly) >= 12:
            trend = (recent_monthly["total"].tail(6).mean() - recent_monthly["total"].tail(12).head(6).mean()) / 6
        else:
            trend = 0
        forecast_vals = [avg + trend * (i+1) for i in range(horizon)]
        method_note = f"Moving average {window} bulan + trend koreksi"

    else:  # Seasonal
        monthly_avg_by_m = dff[dff["tahun"].isin([2021,2022,2023,2024])].groupby("bulan_n")["total_pengeluaran"].mean()
        seasonal_factor = (monthly_avg_by_m / monthly_avg_by_m.mean()).to_dict()
        base_trend = recent_monthly["total"].tail(6).mean()
        trend = (recent_monthly["total"].tail(12).mean() - recent_monthly["total"].tail(24).head(12).mean()) / 12 if len(recent_monthly) >= 24 else 0
        forecast_vals = []
        for i, d in enumerate(future_dates):
            m = d.month
            sf = seasonal_factor.get(m, 1.0)
            forecast_vals.append((base_trend + trend * (i+1)) * sf)
        method_note = "Dekomposisi musiman + tren linear"

    forecast_vals = np.maximum(forecast_vals, 0)  # no negatives

    # ── Main forecast chart ──
    st.markdown('<div class="chart-title">Aktual vs Prediksi</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="chart-subtitle">{method_note}</div>', unsafe_allow_html=True)

    fig = go.Figure()
    # Historical full
    fig.add_trace(go.Scatter(
        x=monthly_full["bulan"], y=monthly_full["total"]/1e6,
        mode="lines", name="Historis",
        line=dict(color=f"rgba(99,179,237,0.5)", width=1.5),
        fill="tozeroy", fillcolor="rgba(99,179,237,0.04)",
    ))
    # Recent highlighted
    fig.add_trace(go.Scatter(
        x=recent_monthly["bulan"], y=recent_monthly["total"]/1e6,
        mode="lines", name="Basis Forecast (2021–)",
        line=dict(color=ACCENT, width=2.5),
    ))
    # Forecast
    fig.add_trace(go.Scatter(
        x=future_str, y=np.array(forecast_vals)/1e6,
        mode="lines+markers", name="Prediksi",
        line=dict(color="#c084fc", width=2.5, dash="dash"),
        marker=dict(size=7, color="#c084fc"),
        fill="tonexty" if False else None,
    ))
    # Confidence band (±15%)
    upper = np.array(forecast_vals) * 1.15
    lower = np.array(forecast_vals) * 0.85
    fig.add_trace(go.Scatter(
        x=future_str + future_str[::-1],
        y=list(upper/1e6) + list(lower/1e6)[::-1],
        fill="toself", fillcolor="rgba(192,132,252,0.08)",
        line=dict(color="rgba(0,0,0,0)"),
        name="Confidence ±15%", showlegend=True,
    ))
    # Gap
    fig.add_vrect(x0="2018-12", x1="2021-01",
        fillcolor="rgba(251,191,36,0.04)", layer="below", line_width=0)
    fig.add_annotation(x="2019-06", y=monthly_full["total"].max()/1e6 * 0.75,
        text="⚠️ 2019–2020<br>No Data",
        showarrow=False, font=dict(color="#fbbf24", size=9),
        bordercolor="#fbbf24", borderwidth=1, borderpad=4,
        bgcolor="rgba(251,191,36,0.08)")
    fig.update_layout(**plotly_layout(height=380, yaxis_title="Juta Rupiah",
        xaxis=dict(nticks=25, tickangle=-45)))
    st.plotly_chart(fig, use_container_width=True)

    # ── Forecast table + KPIs ──
    col_e, col_f = st.columns([2,3])
    with col_e:
        st.markdown('<div class="chart-title">Tabel Prediksi</div>', unsafe_allow_html=True)
        df_fc = pd.DataFrame({
            "Bulan": future_str,
            "Prediksi (Rp)": [f"Rp {v:,.0f}" for v in forecast_vals],
            "Low (Rp)": [f"Rp {v:,.0f}" for v in lower],
            "High (Rp)": [f"Rp {v:,.0f}" for v in upper],
        })
        st.dataframe(df_fc, use_container_width=True, hide_index=True)

    with col_f:
        st.markdown('<div class="chart-title">Distribusi Prediksi per Bulan</div>', unsafe_allow_html=True)
        fig2 = go.Figure()
        fig2.add_trace(go.Bar(
            x=future_str, y=np.array(forecast_vals)/1e6,
            marker_color="#c084fc",
            error_y=dict(type="data", array=(upper-np.array(forecast_vals))/1e6,
                         arrayminus=(np.array(forecast_vals)-lower)/1e6,
                         color="rgba(192,132,252,0.4)", thickness=1.5),
            text=(np.array(forecast_vals)/1e6).round(1).astype(str)+" Jt",
            textposition="outside", textfont=dict(size=9, color="#94a3b8"),
        ))
        fig2.update_layout(**plotly_layout(height=300,
            yaxis_title="Juta Rupiah", bargap=0.3,
            xaxis=dict(tickangle=-45)))
        st.plotly_chart(fig2, use_container_width=True)

    # Forecast KPIs
    st.markdown("---")
    total_fc = sum(forecast_vals)
    actual_last_yr = dff[dff["tahun"]==sorted(dff["tahun"].unique())[-1]]["total_pengeluaran"].sum()
    c1,c2,c3,c4 = st.columns(4)
    c1.metric(f"Total Prediksi {horizon} Bln", fmt_rp(total_fc))
    c2.metric("Rata-rata/Bulan (Pred)", fmt_rp(np.mean(forecast_vals)))
    c3.metric("Perubahan vs Tahun Lalu", f"{pct_delta(sum(forecast_vals[:12]), actual_last_yr):+.1f}%")
    c4.metric("Metode", method.split(" ")[0])


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — INSIGHT
# ═══════════════════════════════════════════════════════════════════════════════
elif halaman == "💡 Insight":
    st.markdown('<div class="page-title">💡 Insight & Analisis Mendalam</div>', unsafe_allow_html=True)
    st.markdown('<div class="page-sub">Temuan otomatis dari 9.183 transaksi · 2015–2024 (data 2019–2020 tidak tersedia)</div>', unsafe_allow_html=True)

    st.markdown("""
    <div class="warning-banner">
        ⚠️ <strong>Gap Data:</strong> Tahun 2019 dan 2020 tidak ada catatan transaksi.
        Analisis yang melibatkan tren multi-tahun mengabaikan periode ini.
        Angka pertumbuhan 2018→2021 bukan mencerminkan periode 3 tahun tetapi 2 tahun pencatatan saja.
    </div>
    """, unsafe_allow_html=True)

    col_a, col_b = st.columns([3,2])

    with col_a:
        # Treemap
        st.markdown('<div class="chart-title">Treemap: Kategori × Tahun</div>', unsafe_allow_html=True)
        tree = dff.groupby(["tahun","kategori"])["total_pengeluaran"].sum().reset_index()
        tree["tahun"] = tree["tahun"].astype(str)
        fig = px.treemap(tree, path=["tahun","kategori"],
            values="total_pengeluaran",
            color="kategori", color_discrete_map=CAT_COLORS)
        fig.update_layout(**plotly_layout(height=340, margin=dict(l=8,r=8,t=20,b=8)))
        fig.update_traces(textinfo="label+percent parent")
        st.plotly_chart(fig, use_container_width=True)

        # Avg per transaction per year
        st.markdown('<div class="chart-title">Rata-rata per Transaksi per Tahun</div>', unsafe_allow_html=True)
        avg_txn = dff.groupby("tahun").agg(avg=("total_pengeluaran","mean")).reset_index()
        max_a = avg_txn["avg"].max()
        avg_txn["color"] = avg_txn["avg"].apply(lambda v: "#f87171" if v==max_a else ACCENT)
        fig2 = go.Figure(go.Bar(
            x=avg_txn["tahun"].astype(str), y=avg_txn["avg"]/1e3,
            marker_color=avg_txn["color"],
            text=(avg_txn["avg"]/1e3).round(0).astype(int).astype(str)+" Rb",
            textposition="outside", textfont=dict(size=10, color="#94a3b8"),
        ))
        fig2.update_layout(**plotly_layout(height=260, yaxis_title="Ribu Rp/Transaksi",
            bargap=0.25))
        st.plotly_chart(fig2, use_container_width=True)

        # Box plot per kategori
        st.markdown('<div class="chart-title">Distribusi Nilai Transaksi per Kategori</div>', unsafe_allow_html=True)
        df_box = dff[dff["total_pengeluaran"] <= 500000].copy()  # cap outliers for viz
        fig3 = go.Figure()
        for kat in sorted(dff["kategori"].unique()):
            vals = df_box[df_box["kategori"]==kat]["total_pengeluaran"]/1e3
            fig3.add_trace(go.Box(
                y=vals, name=kat,
                marker_color=CAT_COLORS.get(kat,"#888"),
                line_color=CAT_COLORS.get(kat,"#888"),
                fillcolor=f"rgba(99,179,237,0.08)",
                boxpoints="outliers",
            ))
        fig3.update_layout(**plotly_layout(height=320, yaxis_title="Ribu Rp",
            showlegend=False,
            xaxis=dict(tickangle=-35)))
        st.plotly_chart(fig3, use_container_width=True)

    with col_b:
        insights = [
            {
                "tag":"⚡ Puncak", "color":"#f87171",
                "title":"2017 = Tahun Paling Boros",
                "num":"Rp 95,5 Jt",
                "body":"Pengeluaran tertinggi dalam 10 tahun data. Didominasi Lain-lain (biaya hidup besar) dan Tagihan/Utilitas. Jumlah transaksi juga tertinggi: 873 transaksi."
            },
            {
                "tag":"⚠️ Gap Data", "color":"#fbbf24",
                "title":"2019 & 2020 Tidak Ada Catatan",
                "num":"2 tahun",
                "body":"Tidak ada data sama sekali untuk 2019 dan 2020. Kemungkinan perpindahan tempat, perubahan tools pencatatan, atau masa pandemi COVID-19 yang mengganggu rutinitas pencatatan."
            },
            {
                "tag":"💹 Investasi", "color":"#4ade80",
                "title":"Investasi Aktif Sejak 2021",
                "num":"Rp 9+ Jt",
                "body":"Kategori Investasi baru muncul di 2021 dan konsisten hadir hingga 2024. Ini adalah sinyal positif pertumbuhan kesadaran finansial — total akumulasi 9+ juta dalam 4 tahun."
            },
            {
                "tag":"🏥 Kesehatan", "color":"#38bdf8",
                "title":"Pengeluaran Kesehatan Naik 16×",
                "num":"+1500%",
                "body":"Dari ~421 Rb di 2016 menjadi 6,6 Jt di 2024. Mencakup gym membership, dokter, obat-obatan. Pertimbangkan asuransi kesehatan komprehensif."
            },
            {
                "tag":"📅 Pola Mingguan", "color":"#c084fc",
                "title":"Kamis = Hari Belanja Terbanyak",
                "num":"77,6 Jt",
                "body":"Kamis mendominasi pengeluaran kumulatif 10 tahun, disusul Selasa. Ini bisa mengindikasikan kebiasaan bayar tagihan atau belanja kebutuhan di pertengahan pekan."
            },
            {
                "tag":"🍔 Makanan", "color":"#fb923c",
                "title":"Makanan/Minuman Naik 35% di 2024",
                "num":"+35,6% YoY",
                "body":"Dari 5,57 Jt (2023) → 7,56 Jt (2024). Kenaikan signifikan yang mungkin dipicu inflasi pangan atau perubahan gaya hidup/makan di luar."
            },
            {
                "tag":"📱 Hiburan", "color":"#e879f9",
                "title":"Hiburan Melonjak 118% di 2024",
                "num":"118,5% YoY",
                "body":"Dari 1,1 Jt → 2,4 Jt. Kenaikan paling dramatis secara persentase. Perlu dievaluasi apakah ini konsumtif atau investasi personal (streaming, event, dll)."
            },
        ]

        for ins in insights:
            c = ins["color"]
            rgb = c.lstrip("#")
            r,g,b = int(rgb[0:2],16), int(rgb[2:4],16), int(rgb[4:6],16)
            st.markdown(f"""
            <div class="insight-card" style="border-left-color:{c}">
                <span class="ins-tag" style="background:rgba({r},{g},{b},0.12);color:{c}">{ins['tag']}</span>
                <div class="ins-title">{ins['title']}</div>
                <div class="ins-num" style="color:{c}">{ins['num']}</div>
                <div class="ins-body">{ins['body']}</div>
            </div>
            """, unsafe_allow_html=True)

    # ── Explorer table ──
    st.markdown("---")
    st.markdown('<div class="chart-title">🔎 Eksplorasi Transaksi</div>', unsafe_allow_html=True)

    cf1, cf2, cf3, cf4 = st.columns([2,2,2,1])
    with cf1:
        fkat = st.selectbox("Kategori", ["Semua"]+sorted(dff["kategori"].unique().tolist()))
    with cf2:
        fyr = st.selectbox("Tahun", ["Semua"]+sorted(dff["tahun"].unique().tolist(), reverse=True))
    with cf3:
        fsort = st.selectbox("Urutan", ["Terbesar","Terkecil","Terbaru","Terlama"])
    with cf4:
        fn = st.number_input("Baris", 10, 200, 30)

    df_exp = dff.copy()
    if fkat != "Semua": df_exp = df_exp[df_exp["kategori"]==fkat]
    if fyr != "Semua":  df_exp = df_exp[df_exp["tahun"]==int(fyr)]
    if fsort == "Terbesar":  df_exp = df_exp.sort_values("total_pengeluaran", ascending=False)
    elif fsort == "Terkecil": df_exp = df_exp.sort_values("total_pengeluaran")
    elif fsort == "Terbaru": df_exp = df_exp.sort_values("tanggal_transaksi", ascending=False)
    else:               df_exp = df_exp.sort_values("tanggal_transaksi")

    df_show = df_exp[["tanggal_transaksi","nama_produk","kategori","total_pengeluaran"]].head(fn).copy()
    df_show.columns = ["Tanggal","Produk","Kategori","Total (Rp)"]
    df_show["Total (Rp)"] = df_show["Total (Rp)"].apply(lambda x: f"Rp {x:,.0f}")
    df_show["Tanggal"] = df_show["Tanggal"].dt.date
    st.dataframe(df_show, use_container_width=True, hide_index=True)