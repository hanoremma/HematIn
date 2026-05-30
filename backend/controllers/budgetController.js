const {

  createBudget,
  getBudgetByUser,
  updateBudget,
  deleteBudget

} = require('../models/budgetModel')

// =========================
// VALIDASI ENUM
// =========================
const allowedType = [
  'Pengeluaran',
  'Pemasukan'
]

// =========================
// CREATE BUDGET
// =========================
const addBudget = async (req, res) => {

  try {

    const {

      id_user,
      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    } = req.body

    // VALIDASI
    if (!allowedType.includes(budget_type)) {

      return res.status(400).json({
        message: 'budget_type tidak valid'
      })

    }

    await createBudget(

      id_user,
      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    )

    res.json({
      message: 'Budget berhasil ditambahkan'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

// =========================
// GET BUDGET
// =========================
const getBudget = async (req, res) => {

  try {

    const { id_user } = req.params

    const result =
      await getBudgetByUser(id_user)

    res.json(result.rows)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

// =========================
// UPDATE BUDGET
// =========================
const editBudget = async (req, res) => {

  try {

    const { id_budget } = req.params

    const {

      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    } = req.body

    // VALIDASI
    if (!allowedType.includes(budget_type)) {

      return res.status(400).json({
        message: 'budget_type tidak valid'
      })

    }

    await updateBudget(

      id_budget,
      id_category,
      amount_limit,
      start_date,
      end_date,
      budget_type,
      description_budget

    )

    res.json({
      message: 'Budget berhasil diupdate'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

// =========================
// DELETE BUDGET
// =========================
const removeBudget = async (req, res) => {

  try {

    const { id_budget } = req.params

    await deleteBudget(id_budget)

    res.json({
      message: 'Budget berhasil dihapus'
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}

module.exports = {

  addBudget,
  getBudget,
  editBudget,
  removeBudget

}
