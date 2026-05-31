const supabase = require('../config/supabase')
const axios = require("axios");

const {

  createTransactionImage,
  getTransactionImage,
  updateTransactionImageStatus

} = require('../models/transactionImgModel')

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
        "http://localhost:8000/api/v1/predict",
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

      await updateTransactionImageStatus(
        result.rows[0].id_transaction_img,
        'success'
      );

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

    res.json({

      message:
        'Transaction image berhasil ditambahkan',

      data: result.rows[0],

      image_url:
        signedUrlData.signedUrl

    })

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