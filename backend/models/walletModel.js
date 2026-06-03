const pool = require('../config/db')

// =========================
// CREATE WALLET
// =========================
const createWallet = async (

  id_user,
  wallet_name,
  balance,
  wallet_type

) => {

  return await pool.query(

    `
    INSERT INTO wallet
    (
      id_user,
      wallet_name,
      balance,
      wallet_type
    )

    VALUES ($1, $2, $3, $4)
    `,

    [
      id_user,
      wallet_name,
      balance,
      wallet_type
    ]

  )

}

// =========================
// GET WALLET
// =========================
const getWalletByUser = async (id_user) => {

  return await pool.query(

    `
    SELECT *
    FROM wallet
    WHERE
      id_user = $1
      AND is_deleted = FALSE
    ORDER BY wallet_created_at DESC
    `,

    [id_user]

  )

}

// =========================
// UPDATE WALLET
// =========================
const updateWallet = async (

  id_wallet,
  wallet_name,
  balance,
  wallet_type

) => {

  return await pool.query(

    `
    UPDATE wallet
    SET

      wallet_name = $1,
      balance = $2,
      wallet_type = $3

    WHERE id_wallet = $4
    `,

    [
      wallet_name,
      balance,
      wallet_type,
      id_wallet
    ]

  )

}

// =========================
// DELETE WALLET
// =========================
const deleteWallet = async (id_wallet) => {

  return await pool.query(

    `
    UPDATE wallet
    SET
      is_deleted = TRUE,
      deleted_at = NOW()
    WHERE id_wallet = $1
    `,

    [id_wallet]

  )

}

module.exports = {

  createWallet,
  getWalletByUser,
  updateWallet,
  deleteWallet

}