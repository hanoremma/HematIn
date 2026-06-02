const pool = require('../config/db')

// =========================
// FIND USER BY EMAIL
// =========================
const findUserByEmail = async (email_user) => {

  return await pool.query(
    `
    SELECT *
    FROM users
    WHERE email_user = $1
    `,
    [email_user]
  )

}

// =========================
// CREATE USER
// =========================
const createUser = async (
  username,
  email_user,
  password,
  phone_number,
  verification_token
) => {

  return await pool.query(
    `
    INSERT INTO users
    (
      username,
      email_user,
      password,
      phone_number,
      verification_token
    )
    VALUES ($1, $2, $3, $4, $5)

    RETURNING *
    `,
    [
      username,
      email_user,
      password,
      phone_number,
      verification_token
    ]
  )

}

// =========================
// GET USER BY ID
// =========================
const getUserById = async (id_user) => {

  return await pool.query(
    `
    SELECT
      id_user,
      username,
      email_user,
      phone_number,
      is_verified
    FROM users
    WHERE id_user = $1
    `,
    [id_user]
  )

}

// =========================
// UPDATE USERNAME
// =========================
const updateUsername = async (
  id_user,
  username
) => {

  return await pool.query(
    `
    UPDATE users
    SET username = $1
    WHERE id_user = $2

    RETURNING
      id_user,
      username,
      email_user,
      phone_number
    `,
    [
      username,
      id_user
    ]
  )

}

// =========================
// FIND USER BY TOKEN
// =========================
const findUserByVerificationToken =
async (token) => {

  return await pool.query(
    `
    SELECT *
    FROM users
    WHERE verification_token = $1
    `,
    [token]
  )

}

// =========================
// VERIFY EMAIL
// =========================
const verifyUserEmail =
async (token) => {

  return await pool.query(
    `
    UPDATE users
    SET
      is_verified = TRUE,
      verification_token = NULL
    WHERE verification_token = $1

    RETURNING *
    `,
    [token]
  )

}

module.exports = {

  findUserByEmail,
  createUser,
  getUserById,
  updateUsername,
  findUserByVerificationToken,
  verifyUserEmail

}