const pool = require('../config/db')

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

const createUser = async (
  username,
  email_user,
  password,
  phone_number
) => {

  return await pool.query(
    `
    INSERT INTO users
    (
      username,
      email_user,
      password,
      phone_number
    )
    VALUES ($1, $2, $3, $4)

    RETURNING *
    `,
    [
      username,
      email_user,
      password,
      phone_number
    ]
  );

}

module.exports = {
  findUserByEmail,
  createUser
}