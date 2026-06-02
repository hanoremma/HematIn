const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');

const transporter =
require('../config/mail');

const {

  findUserByEmail,
  createUser,
  getUserById,
  updateUsername,
  findUserByVerificationToken,
  verifyUserEmail

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
      const verificationToken =
crypto
.randomBytes(32)
.toString('hex');

    // =========================
    // CREATE USER
    // =========================

    const result =
    await createUser(
    
      username,
      email_user,
      hashedPassword,
      phone_number,
      verificationToken
    
    );

    // USER BARU
    const newUser =
      result.rows[0];

      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,
      
        to:
          email_user,
      
        subject:
          'Verifikasi Akun HematIn',
      
        html: `
          <h2>Selamat Datang di HematIn</h2>
      
          <p>
            Klik tombol di bawah untuk verifikasi akun:
          </p>
      
          <a href="http://localhost:3000/auth/verify/${verificationToken}">
            Verifikasi Email
          </a>
        `
      
      });

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
      'Register berhasil. Silakan cek email untuk verifikasi akun.'
    
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
      if (!user.is_verified) {

        return res.status(401).json({
      
          message:
            'Silakan verifikasi email terlebih dahulu'
      
        });
      
      }

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

// =========================
// GET PROFILE
// =========================
const getProfile = async (req, res) => {

  try {

    const result = await getUserById(
      req.user.id_user
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "User tidak ditemukan"
      });

    }

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

// =========================
// UPDATE PROFILE
// =========================
const updateProfile = async (req, res) => {

  try {

    const { username } = req.body;

    if (!username) {

      return res.status(400).json({
        message: "Username wajib diisi"
      });

    }

    const result =
      await updateUsername(
        req.user.id_user,
        username
      );

    res.json({

      message:
        "Nama berhasil diperbarui",

      user:
        result.rows[0]

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

// =========================
// VERIFY EMAIL
// =========================
const verifyEmail = async (
  req,
  res
) => {

  try {

    const { token } =
      req.params;

    const result =
      await findUserByVerificationToken(
        token
      );

    if (
      result.rows.length === 0
    ) {

      return res.status(400).send(
        'Token tidak valid'
      );

    }

    await verifyUserEmail(
      token
    );

    res.send(
      'Email berhasil diverifikasi'
    );

  } catch (error) {

    console.log(error);

    res.status(500).send(
      'Server Error'
    );

  }

};

module.exports = {

  register,
  login,
  getProfile,
  updateProfile,
  verifyEmail

};