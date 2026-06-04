const pool = require('../config/db')

// =========================
// CREATE IMAGE
// =========================
const createTransactionImage = async (

  id_user,
  id_transaction,
  img_nota,
  status

) => {

  return await pool.query(

    `
    INSERT INTO transaction_img
    (
      id_user,
      id_transaction,
      img_nota,
      status
    )

    VALUES ($1,$2,$3,$4)

    RETURNING *
    `,

    [
      id_user,
      id_transaction,
      img_nota,
      status
    ]

  )

}

// =========================
// GET IMAGE
// =========================
const getTransactionImage = async (

  id_transaction

) => {

  return await pool.query(

    `
    SELECT *
    FROM transaction_img

    WHERE id_transaction = $1

    ORDER BY transaction_created_at DESC
    `,

    [id_transaction]

  )

}

const updateTransactionImageStatus = async (
  id_transaction_img,
  status
) => {

  return await pool.query(
    `
    UPDATE transaction_img
    SET status = $1
    WHERE id_transaction_img = $2
    RETURNING *
    `,
    [
      status,
      id_transaction_img
    ]
  );

}

const updateTransactionImageResult = async (
  id_transaction_img,
  ocr_result
) => {

  return await pool.query(
    `
    UPDATE transaction_img
    SET ocr_result = $1
    WHERE id_transaction_img = $2
    RETURNING *
    `,
    [
      JSON.stringify(ocr_result),
      id_transaction_img
    ]
  );

}

const updateTransactionImage = async (
  id_transaction_img,
  id_transaction,
  ocr_result,
  status
) => {

  return pool.query(
    `
    UPDATE transaction_img
    SET
      id_transaction = $1,
      ocr_result = $2,
      status = $3
    WHERE id_transaction_img = $4
    RETURNING *
    `,
    [
      id_transaction,
      JSON.stringify(ocr_result),
      status,
      id_transaction_img
    ]
  );
};

module.exports = {

  createTransactionImage,
  getTransactionImage,
  updateTransactionImageStatus,
  updateTransactionImageResult,
  updateTransactionImage

}