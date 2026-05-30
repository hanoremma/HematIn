import {
  useState,
  useEffect,
  useCallback
} from "react";

import BudgetCard
from "../../components/budget/BudgetCard";

import Modal
from "../../components/ui/Modal";

import BudgetForm
from "../../components/budget/BudgetForm";

import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} from "../../services/budgetService";

import { getCategories }
from "../../services/categoryService";

const EMPTY_FORM = {
  budgetType: "Pengeluaran",
  descriptionBudget: "",
  category: "",
  amountLimit: "",
  startDate: "",
  endDate: "",
};

const BudgetPage = () => {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  /* =========================
     FETCH BUDGETS
  ========================= */

  const fetchBudgets = useCallback(async () => {
    try {
      if (!user?.id_user) return;
      const data = await getBudgets(user.id_user);
      setBudgets(data);
    } catch (error) {
      console.log(error);
    }
  }, [user?.id_user]);

  /* =========================
     FETCH CATEGORIES
  ========================= */

  const fetchCategories = useCallback(async () => {
    try {
      if (!user?.id_user) return;
      const data = await getCategories(user.id_user);
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  }, [user?.id_user]);

  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

  const loadData =
    async () => {

      await fetchBudgets();
      await fetchCategories();

    };

  loadData();

}, [
  fetchBudgets,
  fetchCategories
]);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /* =========================
     HANDLE TYPE
  ========================= */

  const handleTypeChange = (type) => {
    setFormData({ ...formData, budgetType: type, category: "" });
  };

  /* =========================
     OPEN ADD MODAL
  ========================= */

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      budgetType: budget.budget_type,
      descriptionBudget: budget.description_budget,
      category: budget.id_category,
      amountLimit: budget.amount_limit,
      startDate: budget.start_date
        ? budget.start_date.slice(0, 10)
        : "",
      endDate: budget.end_date
        ? budget.end_date.slice(0, 10)
        : "",
    });
    setShowModal(true);
  };

  /* =========================
     HANDLE SUBMIT (add / edit)
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_user: user.id_user,
        id_category: formData.category,
        amount_limit: Number(formData.amountLimit),
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget_type: formData.budgetType,
        description_budget: formData.descriptionBudget,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id_budget, payload);
        alert("Budget berhasil diupdate");
      } else {
        await addBudget(payload);
        alert("Budget berhasil ditambahkan");
      }

      await fetchBudgets();
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     HANDLE DELETE
  ========================= */

  const handleDelete = async (id_budget) => {
    if (!window.confirm("Hapus budget ini?")) return;
    try {
      await deleteBudget(id_budget);
      await fetchBudgets();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="transaction-page">

      {/* HEADER */}
      <div className="transaction-header">

        <div className="budget-title">

          <i className="bi bi-piggy-bank"></i>

          <div>

          <h2>Budgets</h2>

          <p>Kelola budget keuangan</p>

          </div>

        </div>

        <button
          className="add-btn"
          onClick={openAddModal}
        >
          + Tambah Budget
        </button>
      </div>

      {/* CARDS */}
      <div className="budget-grid">
        {budgets.length === 0 ? (
          <p className="empty-state">
            Belum ada budget. Tambahkan budget baru!
          </p>
        ) : (
          budgets.map((item) => (
            <BudgetCard
              key={item.id_budget}
              budget={item}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDelete(item.id_budget)}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <BudgetForm
          formData={formData}
          categories={categories}
          handleChange={handleChange}
          handleTypeChange={handleTypeChange}
          handleSubmit={handleSubmit}
          isEditing={!!editingBudget}
        />
      </Modal>

    </div>
  );

};

export default BudgetPage;
