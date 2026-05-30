const {

  createCategory,
  getCategoryByUser,
  updateCategory,
  deleteCategory

} = require('../models/categoryModel')

// =========================
// CREATE CATEGORY
// =========================
const addCategory = async (req, res) => {

  try {

    const {

      id_user,
      category_name

    } = req.body

    await createCategory(

      id_user,
      category_name

    )

    res.json({
      message: 'Category berhasil ditambahkan'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

// =========================
// GET CATEGORY
// =========================
const getCategory =
  async (req, res) => {

    try {

      const { id_user } =
        req.params;

      const result =
        await getCategoryByUser(
          id_user
        );

      res.json(
        result.rows
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
        'Server Error'
      });

    }

};

// =========================
// UPDATE CATEGORY
// =========================
const editCategory = async (req, res) => {

  try {

    const { id_category } = req.params

    const { category_name } = req.body

    await updateCategory(

      id_category,
      category_name

    )

    res.json({
      message: 'Category berhasil diupdate'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

// =========================
// DELETE CATEGORY
// =========================
const removeCategory = async (req, res) => {

  try {

    const { id_category } = req.params

    await deleteCategory(id_category)

    res.json({
      message: 'Category berhasil dihapus'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

module.exports = {

  addCategory,
  getCategory,
  editCategory,
  removeCategory

}