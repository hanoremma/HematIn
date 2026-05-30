const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const {

  findUserByEmail,
  createUser

} = require('../models/authModel');

// =========================
// DEFAULT CATEGORY
// =========================
const defaultCategories = [

  "Makanan/Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan/Utilitas",
  "Kesehatan",
  "Pendidikan",
  "Hiburan",
  "Investasi",
  "Keuangan",
  "Lain-lain"

];

// =========================
// REGISTER
// =========================
const register = async (req, res) => {

  try {

    const {

      username,
      email_user,
      password,
      phone_number

    } = req.body;

    // =========================
    // CHECK EMAIL
    // =========================

    const checkUser =
      await findUserByEmail(
        email_user
      );

    if (checkUser.rows.length > 0) {

      return res.status(400).json({
        message:
        'Email sudah terdaftar'
      });

    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // =========================
    // CREATE USER
    // =========================

    const result =
      await createUser(

        username,
        email_user,
        hashedPassword,
        phone_number

      );

    // USER BARU
    const newUser =
      result.rows[0];

    // =========================
    // INSERT DEFAULT CATEGORY
    // =========================

    for (const category of defaultCategories) {

      await pool.query(

        `
        INSERT INTO category
        (

          id_user,
          category_name,
          is_default

        )

        VALUES ($1,$2,true)
        `,

        [

          newUser.id_user,
          category

        ]

      );

    }

    // =========================
    // SUCCESS
    // =========================

    res.json({
      message:
      'Register berhasil'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
      'Server Error'
    });

  }

};

// =========================
// LOGIN
// =========================
const login = async (req, res) => {

  try {

    const {

      email_user,
      password

    } = req.body;

    // CHECK USER
    const result =
      await findUserByEmail(
        email_user
      );

    if (result.rows.length === 0) {

      return res.status(400).json({
        message:
        'Email tidak ditemukan'
      });

    }

    const user =
      result.rows[0];

    // CHECK PASSWORD
    const validPassword =
      await bcrypt.compare(

        password,
        user.password

      );

    if (!validPassword) {

      return res.status(400).json({
        message:
        'Password salah'
      });

    }

    // JWT TOKEN
    const token = jwt.sign(

      {

        id_user:
        user.id_user,

        email_user:
        user.email_user

      },

      process.env.JWT_SECRET,

      {

        expiresIn: '1d'

      }

    );

    res.json({

      message:
      'Login berhasil',

      token,

      user

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
      'Server Error'
    });

  }

};

module.exports = {

  register,
  login

};