const pool = require('../config/db')

// =========================
// CREATE BUDGET
// =========================
const createBudget = async (

  id_user,
  id_category,
  amount_limit,
  start_date,
  end_date,
  budget_type,
  description_budget

) => {

  return await pool.query(

    `
    INSERT INTO budget
    (

      id_user,
      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    )

    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,

    [

      id_user,
      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    ]

  )

}

// =========================
// GET BUDGET
// =========================
const getBudgetByUser =
  async (id_user) => {

    return await pool.query(

      `
      SELECT

        b.id_budget,
        b.id_user,
        b.id_category,
        b.amount_limit,
        b.start_date,
        b.end_date,
        b.budget_type,
        b.description_budget,

        c.category_name,

        COALESCE(

          SUM(t.amount),

          0

        )::numeric AS used_amount

      FROM budget b

      LEFT JOIN category c

      ON

      b.id_category =
      c.id_category

      LEFT JOIN transactions t

      ON

      t.id_category =
      b.id_category

      AND

      t.id_user =
      b.id_user

      AND

      t.transaction_type::text =
      b.budget_type::text

      AND

      t.transaction_date
      BETWEEN
      b.start_date
      AND
      b.end_date

      WHERE b.id_user = $1

      GROUP BY

        b.id_budget,
        b.id_user,
        b.id_category,
        b.amount_limit,
        b.start_date,
        b.end_date,
        b.budget_type,
        b.description_budget,
        c.category_name

      ORDER BY
      b.start_date DESC
      `,

      [id_user]

    )

}

// =========================
// UPDATE BUDGET
// =========================
const updateBudget = async (

  id_budget,
  id_category,
  amount_limit,
  start_date,
  end_date,
  budget_type,
  description_budget

) => {

  return await pool.query(

    `
    UPDATE budget

    SET

      id_category = $1,
      amount_limit = $2,
      start_date = $3,
      end_date = $4,
      budget_type = $5,
      description_budget = $6

    WHERE id_budget = $7
    `,

    [

      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget,
      id_budget

    ]

  )

}

// =========================
// DELETE BUDGET
// =========================
const deleteBudget =
  async (id_budget) => {

    return await pool.query(

      `
      DELETE FROM budget
      WHERE id_budget = $1
      `,

      [id_budget]

    )

}

module.exports = {

  createBudget,
  getBudgetByUser,
  updateBudget,
  deleteBudget

}