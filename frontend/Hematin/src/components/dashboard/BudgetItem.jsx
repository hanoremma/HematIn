const BudgetItem = ({
  title,
  used = 0,
  limit = 0,
}) => {

  const usedAmount =
    Number(used);

  const limitAmount =
    Number(limit);

  const percent =
    limitAmount > 0
      ? Math.round(
          (usedAmount /
            limitAmount) * 100
        )
      : 0;

  const progressWidth =
    Math.min(percent, 100);

  const remaining =
    limitAmount - usedAmount;

  const status =
  percent > 100
    ? "Over Budget"
    : "Aman";

const statusClass =
  percent > 100
    ? "danger"
    : "safe";

  return (

    <div className="dashboard-budget-item">

      <div className="dashboard-budget-info">

        <h6>{title}</h6>

        <span>
          {percent}%
        </span>

      </div>

      <div className="dashboard-budget-bar">

        <div
          className={`dashboard-budget-progress ${statusClass}`}
          style={{
            width: `${progressWidth}%`
          }}
        />

      </div>

      <p className="dashboard-budget-used">

        Terpakai Rp{" "}

        {usedAmount.toLocaleString(
          "id-ID"
        )}

        {" "}dari Rp{" "}

        {limitAmount.toLocaleString(
          "id-ID"
        )}

      </p>

      <p className="dashboard-budget-remaining">

        Sisa Rp{" "}

        {remaining.toLocaleString(
          "id-ID"
        )}

      </p>

      <span
        className={`dashboard-budget-status ${statusClass}`}
      >

        {status}

      </span>

    </div>

  );

};

export default BudgetItem;