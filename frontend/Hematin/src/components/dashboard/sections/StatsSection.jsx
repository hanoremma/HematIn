import StatCard from "../StatCard";

const StatsSection = ({
  dashboard
}) => {

  const summary =
    dashboard?.data ||
    dashboard?.dashboard ||
    dashboard?.summary ||
    dashboard ||
    {};

  const parseAmount = (value) => {

    const amount =
      Number(value);

    return Number.isFinite(amount)
      ? amount
      : 0;

  };

  const totalBalance =
    parseAmount(
      summary.total_balance ??
      summary.totalBalance
    );

  const totalIncome =
    parseAmount(
      summary.total_income ??
      summary.totalIncome
    );

  const totalExpense =
    parseAmount(
      summary.total_expense ??
      summary.totalExpense
    );

  return (

    <div className="stats-section">

      <StatCard
        title="Total Saldo"
        amount={`Rp ${totalBalance.toLocaleString("id-ID")}`}
        icon="bi bi-wallet2"
        iconClass="balance-icon"
      />

      <StatCard
        title="Total Pemasukan"
        amount={`Rp ${totalIncome.toLocaleString("id-ID")}`}
        icon="bi bi-graph-up-arrow"
        iconClass="income-icon"
      />

      <StatCard
        title="Total Pengeluaran"
        amount={`Rp ${totalExpense.toLocaleString("id-ID")}`}
        icon="bi bi-graph-down-arrow"
        iconClass="expense-icon"
      />

    </div>

  );

};

export default StatsSection;
