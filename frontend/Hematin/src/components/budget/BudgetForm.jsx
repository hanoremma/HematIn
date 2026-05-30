import TransactionTypeToggle
from "../transaction/TransactionTypeToggle";

import "../../dist/css/Transaction.css";

const BudgetForm = ({

  formData,

  categories = [],

  handleChange,

  handleTypeChange,

  handleSubmit,

  isEditing = false,

}) => {

  console.log(
    "FORM CATEGORY:",
    categories
  );

  return (

    <form
      className="budget-form"
      onSubmit={handleSubmit}
    >

      {/* TITLE */}

      <h2 className="form-title">

        {
          isEditing

            ? "Edit Budget"

            : "Add Budget"
        }

      </h2>

      {/* =========================
         BUDGET TYPE
      ========================= */}

      <div className="form-group">

        <label>
          Budget Type
        </label>

        <TransactionTypeToggle

          value={
            formData.budgetType
          }

          onChange={
            handleTypeChange
          }

        />

      </div>

      {/* =========================
         BUDGET TITLE
      ========================= */}

      <div className="form-group">

        <label>
          Budget Title
        </label>

        <input

          type="text"

          name="descriptionBudget"

          placeholder="
          Enter budget title
          "

          value={
            formData
            .descriptionBudget
          }

          onChange={
            handleChange
          }

          required

        />

      </div>

      {/* =========================
         CATEGORY
      ========================= */}

      <div className="form-group">

        <label>
          Category
        </label>

        <select

          name="category"
          value={formData.category}
          onChange={handleChange}

          required

        >

          <option value="">

            Select Category

          </option>

          {
            categories.map(
              (cat) => (

              <option

                key={
                  cat.id_category
                }

                value={
                  cat.id_category
                }

              >

                {
                  cat.category_name
                }

              </option>

            ))
          }

        </select>

      </div>

      {/* =========================
         LIMIT
      ========================= */}

      <div className="form-group">

        <label>
          Amount Limit
        </label>

        <input

          type="number"

          name="amountLimit"

          placeholder="
          Enter amount limit
          "

          value={
            formData.amountLimit
          }

          onChange={
            handleChange
          }

          min="0"

          required

        />

      </div>

      {/* =========================
         START DATE
      ========================= */}

      <div className="form-group">

        <label>
          Start Date
        </label>

        <input

          type="date"

          name="startDate"

          value={
            formData.startDate
          }

          onChange={
            handleChange
          }

          required

        />

      </div>

      {/* =========================
         END DATE
      ========================= */}

      <div className="form-group">

        <label>
          End Date
        </label>

        <input

          type="date"

          name="endDate"

          value={
            formData.endDate
          }

          onChange={
            handleChange
          }

          required

        />

      </div>

      {/* =========================
         WARNING
      ========================= */}

      <div className="budget-info">

        <p>

          ℹ Budget hanya
          memberikan peringatan
          ketika limit terlampaui.

        </p>

      </div>

      {/* =========================
         SUBMIT
      ========================= */}
      <button
        type="submit"
        className="submit-btn"
      >
        {
          isEditing
            ? "Update Budget"
            : "Save Budget"
        }
      </button>
    </form>
  );
};

export default BudgetForm;