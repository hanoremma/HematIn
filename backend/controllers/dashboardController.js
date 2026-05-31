const {

    getTotalBalance,
    getTotalIncome,
    getTotalExpense
  
  } = require('../models/dashboardModel')

  const {

  getExpenseByCategory,
  getMonthlyAnalytics,
  getWeeklyExpense

} = require('../models/dashboardModel')
  
  // =========================
  // GET DASHBOARD
  // =========================
  const getDashboard = async (req, res) => {
  
    try {
  
      const { id_user } = req.params
  
      // =========================
      // TOTAL BALANCE
      // =========================
      const totalBalance =
        await getTotalBalance(id_user)
  
      // =========================
      // TOTAL PEMASUKAN
      // =========================
      const totalIncome =
        await getTotalIncome(id_user)
  
      // =========================
      // TOTAL PENGELUARAN
      // =========================
      const totalExpense =
        await getTotalExpense(id_user)
  
      // =========================
      // RESPONSE
      // =========================
      res.json({
  
        total_balance:
          totalBalance.rows[0].total_balance,
  
        total_income:
          totalIncome.rows[0].total_income,
  
        total_expense:
          totalExpense.rows[0].total_expense
  
      })
  
    } catch (error) {
  
      console.log(error)
  
      res.status(500).json({
        message: 'Server Error'
      })
  
    }
  
  }

  const getAnalytics = async (req, res) => {

  try {

    const { id_user } = req.params

    const categories =
      await getExpenseByCategory(id_user)

    const monthly =
      await getMonthlyAnalytics(id_user)

    const weekly =
      await getWeeklyExpense(id_user)

    res.json({

      categories:
        categories.rows,

      monthly:
        monthly.rows,

      weekly:
        weekly.rows

    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: 'Server Error'
    })

  }

}
  
  module.exports = {
  
    getDashboard,
    getAnalytics
  
  }