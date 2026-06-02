const axios = require('axios');
const pool = require('../config/db');

const getRecommendation = async (req, res) => {

    let transaksi = [];

  try {

    const userId = req.user.id_user;

    console.log("================================");
    console.log("JWT USER :", req.user);
    console.log("JWT ID   :", userId);
    console.log("================================");

    const transactionResult =
      await pool.query(
        `
        SELECT
          t.amount,
          t.description,
          c.category_name
        FROM transactions t

        JOIN category c
        ON t.id_category = c.id_category

        WHERE t.id_user = $1
        AND t.transaction_type = 'Pengeluaran'

        ORDER BY t.transaction_date DESC

        LIMIT 10
        `,
        [userId]
      );

    console.log(
      "TRANSACTION RESULT:",
      transactionResult.rows
    );

    transaksi = transactionResult.rows.map(item => ({

        nama_produk:
          item.description || "Transaksi",

        kategori:
          item.category_name,

        total_pengeluaran:
          Number(item.amount)

      }));

      if (transaksi.length === 0) {

  return res.json({

    status: "empty",

    rekomendasi:
      "Belum ada transaksi untuk dianalisis.",

    ringkasan: {

      total_pengeluaran: 0,

      jumlah_item: 0

    }

  });

}

    const payload = {

      transaksi,

      riwayat_bulanan: [
        {
          bulan: "2025-06",
          total: 1000000,
          kategori_terbesar: "Makanan/Minuman"
        }
      ],

      target_hemat: 500000,

      gaya_hidup: "normal"

    };

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    const response =
      await axios.post(
        'https://api-rekomendasi-production.up.railway.app/rekomendasi',
        payload
      );

    res.json(response.data);

  } catch (error) {

    console.log("==============");
    console.log("AI ERROR");
    console.log(error.response?.data);
    console.log(error.message);
    console.log("==============");
  
    const totalPengeluaran =
      transaksi.reduce(
  
        (total, item) =>
  
          total +
          item.total_pengeluaran,
  
        0
  
      );
  
    let rekomendasi = "";
  
    if (totalPengeluaran > 1000000) {
  
      rekomendasi =
        "Pengeluaran bulan ini cukup tinggi. Kurangi pembelian non-prioritas dan fokus pada kebutuhan utama.";
  
    }
  
    else if (totalPengeluaran > 500000) {
  
      rekomendasi =
        "Pengeluaran masih dalam batas wajar. Pantau kategori dengan pengeluaran terbesar agar tidak melebihi anggaran.";
  
    }
  
    else {
  
      rekomendasi =
        "Keuangan cukup sehat. Pertahankan kebiasaan menabung dan catat semua transaksi secara rutin.";
  
    }
  
    return res.json({
  
      status: "fallback",
  
      rekomendasi,
  
      ringkasan: {
  
        total_pengeluaran:
          totalPengeluaran,
  
        jumlah_item:
          transaksi.length
  
      }
  
    });
  
  }

};

module.exports = {
  getRecommendation
};