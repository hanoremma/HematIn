const pool = require('../config/db')

// =========================
// CREATE CATEGORY
// =========================
const createCategory = async (

  id_user,
  category_name

) => {

  return await pool.query(

    `
    INSERT INTO category
    (
      id_user,
      category_name
    )

    VALUES ($1, $2)
    `,

    [
      id_user,
      category_name
    ]

  )

}

// =========================
// GET CATEGORY
// =========================
const getCategoryByUser =
  async (id_user) => {

    return await pool.query(

      `
      SELECT *
      FROM category
      WHERE
        id_user = $1
        AND is_deleted = FALSE
      ORDER BY category_name ASC
      `,

      [id_user]

    );

};
// =========================
// UPDATE CATEGORY
// =========================
const updateCategory = async (

  id_category,
  category_name

) => {

  return await pool.query(

    `
    UPDATE category
    SET

      category_name = $1

    WHERE id_category = $2
    `,

    [
      category_name,
      id_category
    ]

  )

}

// =========================
// DELETE CATEGORY
// =========================
const deleteCategory = async (id_category) => {

  return await pool.query(

    `
    UPDATE category
    SET
      is_deleted = TRUE,
      deleted_at = NOW()
    WHERE id_category = $1
    `,

    [id_category]

  )

}

module.exports = {

  createCategory,
  getCategoryByUser,
  updateCategory,
  deleteCategory

}