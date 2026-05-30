import StatCard from "../StatCard";

const StatsSection = ({
  transactions = [],
  wallets = []
}) => {

  const totalIncome =
    transactions
      .filter(
        t =>
          t.transaction_type ===
          "Pemasukan"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

  const totalExpense =
    transactions
      .filter(
        t =>
          t.transaction_type ===
          "Pengeluaran"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

  const totalBalance =
    wallets.reduce(
      (sum, wallet) =>
        sum +
        Number(wallet.balance),
      0
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