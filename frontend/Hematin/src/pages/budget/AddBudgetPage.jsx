import {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import BudgetForm
from "../../components/budget/BudgetForm";

import {
  addBudget
} from "../../services/budgetService";

import {
  getCategories
} from "../../services/categoryService";

const initialFormData = {

  budgetType:
    "Pengeluaran",

  descriptionBudget:
    "",

  category:
    "",

  amountLimit:
    "",

  startDate:
    "",

  endDate:
    ""

};

const AddBudgetPage = () => {

  const navigate =
    useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /* =========================
     STATE
  ========================= */

  const [formData,
  setFormData] =
    useState(initialFormData);

  const [categories,
  setCategories] =
    useState([]);

  /* =========================
     FETCH CATEGORY
  ========================= */

  useEffect(() => {

  const fetchCategories =
    async () => {

      try {

        console.log(
          "USER:",
          user
        );

        console.log(
          "USER ID:",
          user?.id_user
        );

        const data =
          await getCategories(
            user?.id_user
          );

        console.log(
          "FETCH CATEGORY:",
          data
        );

        setCategories(data);

      } catch (error) {

        console.log(error);

      }

    };

  fetchCategories();

}, [user]);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange =
    (e) => {

      const {
        name,
        value
      } = e.target;

      setFormData((prev) => ({

        ...prev,
        [name]: value

      }));

  };

  /* =========================
     HANDLE TYPE
  ========================= */

  const handleTypeChange =
    (type) => {

      setFormData((prev) => ({

        ...prev,
        budgetType: type

      }));

  };

  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        const payload = {

          id_user:
            user.id_user,

          id_category:
            formData.category,

          amount_limit:
            Number(
              formData.amountLimit
            ),

          start_date:
            formData.startDate,

          end_date:
            formData.endDate,

          budget_type:
            formData.budgetType,

          description_budget:
            formData
            .descriptionBudget

        };

        console.log(payload);

        await addBudget(
          payload
        );

        alert(
          "Budget berhasil ditambahkan"
        );

        navigate("/budgets");

      } catch (error) {

        console.log(error);

        alert(

          error?.response
          ?.data?.message

          ||

          "Gagal tambah budget"

        );

      }

  };

  console.log(
  "CATEGORY STATE:",
  categories
);

  return (

    <div className="page-container">

      <BudgetForm

        formData={formData}

        categories={categories}

        handleChange={
          handleChange
        }

        handleTypeChange={
          handleTypeChange
        }

        handleSubmit={
          handleSubmit
        }

      />

    </div>

  );

};

export default AddBudgetPage;