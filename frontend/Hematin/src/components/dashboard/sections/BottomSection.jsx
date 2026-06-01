import TransactionList from "../TransactionList";
import FinanceTipsCard from "../FinanceTipsCard";

const BottomSection = ({ transactions}) => {
  return (
    <div className="bottom-section">

      <TransactionList transactions={transactions} />

      <FinanceTipsCard />

    </div>
  );
};

export default BottomSection;