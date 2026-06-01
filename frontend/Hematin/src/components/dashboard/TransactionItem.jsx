const TransactionItem = ({
  title,
  date,
  amount,
  type,
}) => {

  const isIncome =
    type === "Pemasukan";

  return (

    <div className="transaction-item">

      <div className="transaction-left">

        <div
          className={`transaction-icon ${
            isIncome
              ? "income"
              : "expense"
          }`}
        >

          <i
            className={
              isIncome
                ? "bi bi-arrow-down-circle"
                : "bi bi-arrow-up-circle"
            }
          />

        </div>

        <div className="transaction-detail">

          <h6>{title}</h6>

          <p>{date}</p>

        </div>

      </div>

      <h5
        className={`transaction-amount ${
          isIncome
            ? "income"
            : "expense"
        }`}
      >

        {isIncome ? "+" : "-"}

        Rp{" "}

        {Number(amount)
          .toLocaleString("id-ID")}

      </h5>

    </div>

  );

};

export default TransactionItem;