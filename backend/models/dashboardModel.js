const pool = require('../config/db')

// =========================
// TOTAL BALANCE
// =========================
const getTotalBalance = async (id_user) => {

  return await pool.query(

    `
    SELECT

      COALESCE(SUM(balance), 0)
      AS total_balance

    FROM wallet

    WHERE id_user = $1
    `,

    [id_user]

  )

}

// =========================
// TOTAL PEMASUKAN
// =========================
const getTotalIncome = async (id_user) => {

  return await pool.query(

    `
    SELECT

      COALESCE(SUM(amount), 0)
      AS total_income

    FROM transactions

    WHERE id_user = $1

    AND transaction_type = 'Pemasukan'
    `,

    [id_user]

  )

}

// =========================
// TOTAL PENGELUARAN
// =========================
const getTotalExpense = async (id_user) => {

  return await pool.query(

    `
    SELECT

      COALESCE(SUM(amount), 0)
      AS total_expense

    FROM transactions

    WHERE id_user = $1

    AND transaction_type = 'Pengeluaran'
    `,

    [id_user]

  )

}

const getExpenseByCategory = async (id_user) => {

  return await pool.query(
    `
    SELECT

      c.category_name,

      COALESCE(
        SUM(t.amount),
        0
      ) AS total

    FROM transactions t

    JOIN category c

    ON t.id_category = c.id_category

    WHERE

      t.id_user = $1

      AND

      t.transaction_type = 'Pengeluaran'

    GROUP BY c.category_name

    ORDER BY total DESC
    `,
    [id_user]
  )

}

const getMonthlyAnalytics = async (id_user) => {

  return await pool.query(
    `
    SELECT

      TO_CHAR(
        transaction_date,
        'Mon'
      ) AS month,

      COALESCE(
        SUM(
          CASE
            WHEN transaction_type = 'Pemasukan'
            THEN amount
            ELSE 0
          END
        ),
        0
      ) AS income,

      COALESCE(
        SUM(
          CASE
            WHEN transaction_type = 'Pengeluaran'
            THEN amount
            ELSE 0
          END
        ),
        0
      ) AS expense

    FROM transactions

    WHERE id_user = $1

    GROUP BY
      TO_CHAR(transaction_date, 'Mon'),
      DATE_TRUNC('month', transaction_date)

    ORDER BY
      DATE_TRUNC('month', transaction_date)
    `,
    [id_user]
  )

}

const getWeeklyExpense = async (id_user) => {

  return await pool.query(

    `
    SELECT
      DATE(transaction_date) AS day,
      SUM(
        CASE
          WHEN transaction_type =
          'Pemasukan'
          THEN amount
          ELSE 0
        END
      ) AS income,
      SUM(
        CASE
          WHEN transaction_type =
          'Pengeluaran'
          THEN amount
          ELSE 0
        END
      ) AS expense
    FROM transactions
    WHERE
      id_user = $1
      AND
      transaction_date >=
      NOW() - INTERVAL '7 days'
    GROUP BY day
    ORDER BY day
    `,

    [id_user]

  )

}

module.exports = {

  getTotalBalance,
  getTotalIncome,
  getTotalExpense,
  getExpenseByCategory,
  getMonthlyAnalytics,
  getWeeklyExpense

}