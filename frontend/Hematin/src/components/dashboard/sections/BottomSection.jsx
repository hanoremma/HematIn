import TransactionList from "../TransactionList";
import FinanceTipsCard from "../FinanceTipsCard";

const BottomSection = ({
  transactions,
  recommendation,
  loadingAi
}) => {

  return (

    <div className="bottom-section">

      <TransactionList
        transactions={transactions}
      />

      <FinanceTipsCard
        recommendation={recommendation}
        loadingAi={loadingAi}
      />

    </div>

  );

};

export default BottomSection;