const BudgetCard = ({
  budget,
  onEdit,
  onDelete,
}) => {

  const usedAmount = Number(budget.used_amount) || 0;

      const percentage =
  budget.amount_limit > 0
    ? Math.round(
        (usedAmount / budget.amount_limit) * 100
      )
    : 0;

const progressWidth = Math.min(
  percentage,
  100
);

const remaining =
  budget.amount_limit - usedAmount;

const status =
  percentage >= 100
    ? "Over Budget"
    : percentage >= 80
    ? "Hampir Habis"
    : "Aman";

const statusClass =
  percentage >= 100
    ? "danger"
    : percentage >= 80
    ? "warning"
    : "safe";

const progressColor =
  percentage >= 100
    ? "#ef4444"
    : percentage >= 80
    ? "#f59e0b"
    : "#22c55e";
  return (

    <div className="budget-card">

      <div className="budget-card-top">
  <div>
    <h3>{budget.description_budget}</h3>
  </div>

  <div className="budget-header-right">
    <span
      className={`budget-percentage ${statusClass}`}
    >
      {percentage}%
    </span>

    <span
      className={`budget-status ${statusClass}`}
    >
      {status}
    </span>
  </div>
</div>
      <p className="budget-category">

        {budget.category_name}

      </p>

      <div className="budget-amount">

        <strong>

          Rp {
            Number(
              usedAmount
            ).toLocaleString(
              "id-ID"
            )
          }

        </strong>

        {" / "}

        Rp {
          Number(
            budget.amount_limit
          ).toLocaleString(
            "id-ID"
          )
        }

      </div>

      {/* PROGRESS */}

      <div className="budget-progress">
  <div
    className="budget-progress-fill"
    style={{
      width: `${progressWidth}%`,
      background: progressColor,
    }}
  />
</div>

      {percentage >= 100 && (
        <p className="budget-over-limit">
          ⚠ Batas budget tercapai!
        </p>
      )}

      <p className="budget-remaining">

        Sisa Rp {
          remaining.toLocaleString(
            "id-ID"
          )
        }

      </p>

      <p className="budget-date">

        {
          new Date(
            budget.start_date
          ).toLocaleDateString()
        }

        {" - "}

        {
          new Date(
            budget.end_date
          ).toLocaleDateString()
        }

      </p>

      <div className="budget-actions">

        <button
          className="edit-btn"
          onClick={onEdit}
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={onDelete}
        >
          Delete
        </button>

      </div>

    </div>

  );

};

export default BudgetCard;