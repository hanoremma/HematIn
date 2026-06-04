const pool = require('../config/db')

// =========================
// CREATE TRANSACTION
// =========================
const createTransaction = async (

  id_user,
  id_wallet,
  id_category,
  id_budget,
  transaction_type,
  amount,
  description,
  transaction_date,
  source

) => {

  return await pool.query(

    `
    INSERT INTO transactions
    (
      id_user,
      id_wallet,
      id_category,
      id_budget,
      transaction_type,
      amount,
      description,
      transaction_date,
      source
    )

    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,

    [
      id_user,
      id_wallet,
      id_category,
      id_budget,
      transaction_type,
      amount,
      description,
      transaction_date,
      source
    ]

  )

}

// =========================
// GET TRANSACTION
// =========================
const getTransactionByUser = async (id_user) => {

  return await pool.query(

    `
    SELECT

      t.*,
      w.wallet_name,
      c.category_name

    FROM transactions t

    LEFT JOIN wallet w
    ON t.id_wallet = w.id_wallet

    LEFT JOIN category c
    ON t.id_category = c.id_category

    WHERE t.id_user = $1

    ORDER BY t.transaction_created_at DESC
    `,

    [id_user]

  )

}

/* =========================
   GET TRANSACTION BY ID
========================= */

const getTransactionById =
  async (id_transaction) => {

    return await pool.query(

      `
      SELECT *
      FROM transactions
      WHERE id_transaction = $1
      `,

      [id_transaction]

    );

};

// =========================
// UPDATE TRANSACTION
// =========================
const updateTransaction = async (

    id_transaction,
    id_wallet,
    id_category,
    transaction_type,
    amount,
    description,
    transaction_date,

) => {

  return await pool.query(

    `
    UPDATE transactions
    SET

      id_wallet = $1,
      id_category = $2,
      transaction_type = $3,
      amount = $4,
      description = $5,
      transaction_date = $6

    WHERE id_transaction = $7
    `,

    [
      id_wallet,
      id_category,
      transaction_type,
      amount,
      description,
      transaction_date,
      id_transaction
    ]

  )

}

// =========================
// DELETE TRANSACTION
// =========================
const deleteTransaction = async (id_transaction) => {

  return await pool.query(

    `
    DELETE FROM transactions
    WHERE id_transaction = $1
    `,

    [id_transaction]

  )

}

module.exports = {

  createTransaction,
  getTransactionByUser,
  getTransactionById,
  updateTransaction,
  deleteTransaction

}