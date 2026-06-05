const supabase = require('../config/supabase')
const axios = require("axios");
const pool = require('../config/db');

const {
  createTransactionImage,
  getTransactionImage,
  updateTransactionImageStatus,
  updateTransactionImageResult,
  updateTransactionImage,
} = require('../models/transactionImgModel')

const { createTransaction } = require('../models/transactionModel')

// =========================
// CREATE IMAGE
// =========================
const addTransactionImage = async (req, res) => {

  try {

    const file = req.file

const {
  id_transaction = null
} = req.body;

const id_user =
  req.user.id_user;

if (!id_user) {

  return res.status(400).json({

    message: 'id_user wajib dikirim'

  })

}

// VALIDASI FILE
if (!file) {

  return res.status(400).json({

    message: 'File wajib diupload'

  })

}

    // NAMA FILE
    const fileName =

      `receipts/${Date.now()}-${file.originalname}`

    // UPLOAD KE SUPABASE STORAGE
    const {

      data,
      error

    } = await supabase.storage

      .from('receipt')

      .upload(

        fileName,

        file.buffer,

        {

          contentType: file.mimetype

        }

      )

    // ERROR STORAGE
    if (error) {

      return res.status(500).json({

        message: error.message

      })

    }

    // GENERATE SIGNED URL
    const {

      data: signedUrlData

    } = await supabase.storage

      .from('receipt')

      .createSignedUrl(

        fileName,

        60 * 10

      )

    // SAVE DATABASE
    const result =

      await createTransactionImage(

        id_user,
        id_transaction,
        fileName,
        'uploaded'

      )

      await updateTransactionImageStatus(
        result.rows[0].id_transaction_img,
        'pending'
      );

      try{

      console.log("=== REQUEST KE FASTAPI ===");
      
      const ocrResponse = await axios.post(

        `${process.env.AI_SERVICE_URL}/api/v1/predict`,
        {
          file_url: signedUrlData.signedUrl,

          job_id:result.rows[0].id_transaction_img,
          
          mime_type:file.mimetype
        },
        {
          headers: {
            "x-api-key":process.env.AI_SERVICE_API_KEY
          }
        }
      
      );
      console.log("=== RESPONSE FASTAPI ===");
      console.log(ocrResponse.data);

      const ocr = ocrResponse.data;

      // ── 1. Cari kategori user yang cocok dengan hasil OCR ──
      const categoryName = ocr.classification?.category ?? "";
      let catResult = await pool.query(
        `SELECT id_category FROM category
         WHERE id_user = $1 AND LOWER(category_name) = LOWER($2) AND is_deleted = FALSE
         LIMIT 1`,
        [id_user, categoryName]
      );
      // Fallback: cari "Lain-lain"
      if (!catResult.rows[0]) {
        catResult = await pool.query(
          `SELECT id_category FROM category
           WHERE id_user = $1 AND LOWER(category_name) = 'lain-lain' AND is_deleted = FALSE
           LIMIT 1`,
          [id_user]
        );
      }
      // Fallback: kategori pertama milik user
      if (!catResult.rows[0]) {
        catResult = await pool.query(
          `SELECT id_category FROM category
           WHERE id_user = $1 AND is_deleted = FALSE
           LIMIT 1`,
          [id_user]
        );
      }

      // ── 2. Ambil wallet pertama user ──
      let walletResult = await pool.query(
        `SELECT id_wallet FROM wallet WHERE id_user = $1 AND is_deleted = FALSE ORDER BY wallet_created_at ASC LIMIT 1`,
        [id_user]
      );
      // Fallback tanpa filter is_deleted jika semua deleted
      if (!walletResult.rows[0]) {
        walletResult = await pool.query(
          `SELECT id_wallet FROM wallet WHERE id_user = $1 LIMIT 1`,
          [id_user]
        );
      }

      const id_category = catResult.rows[0]?.id_category ?? null;
      const id_wallet   = walletResult.rows[0]?.id_wallet ?? null;

      console.log("=== OCR MAPPING ===", { categoryName, id_category, id_wallet });

      // ── 3. Buat deskripsi dari item OCR ──
      const items = ocr.items ?? [];
      const description = items.length > 0
        ? items.map((i) => i.name).join(", ")
        : categoryName || "Transaksi OCR";

      // ── 4. Buat transaksi otomatis ──
      const transactionResult = await createTransaction(
        id_user,
        id_wallet,
        id_category,
        null,
        "Pengeluaran",
        Math.round(ocr.total_expense ?? 0),
        description,
        new Date().toISOString(),
        "Scan"
      );
      const newTransaction = transactionResult.rows[0];

      // ── 5. Update transaction_img: simpan ocr_result + id_transaction ──
      let imageRow = result.rows[0];

      try {
        const finalRow = await updateTransactionImage(
          result.rows[0].id_transaction_img,
          newTransaction.id_transaction,
          ocr,
          'success'
        );

        imageRow = finalRow.rows[0];
      } catch (imageError) {
        console.log("TRANSACTION IMAGE UPDATE ERROR");
        console.log(imageError);
      }

      return res.json({
        message: 'Transaction image berhasil ditambahkan',
        data: imageRow,
        transaction: newTransaction,
        image_url: signedUrlData.signedUrl,
      });

    } catch (error) {
      await updateTransactionImageStatus(
        result.rows[0].id_transaction_img,
        'failed'
      );
      console.log("FASTAPI ERROR");
      console.log(error.response?.status);
      console.log(error.response?.data);
      throw error;
    }

  } catch (error) {

    console.log(error)

    res.status(500).json({

      message: 'Server Error'

    })

  }

}

// =========================
// GET IMAGE
// =========================
const getImage = async (req, res) => {

  try {

    const { id_transaction } = req.params

    const result =

      await getTransactionImage(
        id_transaction
      )

    // GENERATE SIGNED URL
    const images = await Promise.all(

      result.rows.map(async (item) => {

        const {

          data

        } = await supabase.storage

          .from('receipt')

          .createSignedUrl(

            item.img_nota,

            60 * 10

          )

        return {

          ...item,

          image_url:
            data.signedUrl

        }

      })

    )

    res.json(images)

  } catch (error) {

    console.log(error)

    res.status(500).json({

      message: 'Server Error'

    })

  }

}

module.exports = {

  addTransactionImage,
  getImage

}
