import FinanceChart from "../FinanceChart";
import BudgetCard from "../BudgetCard";

const AnalyticsSection = ({
  analytics,
  budgets
}) => {

  return (

    <div className="analytics-section">

      <FinanceChart
        analytics={analytics}
      />

      <BudgetCard
        budgets={budgets}
      />

    </div>

  );

};

export default AnalyticsSection;