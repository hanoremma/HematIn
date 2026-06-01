import BudgetItem from "./BudgetItem";

const BudgetCard = ({
  budgets = []
}) => {

  return (

    <div className="budget-card">

      <h4>
        Rencana Anggaran
      </h4>

      {
        budgets.length === 0
        ? (
          <p>
            Belum ada budget
          </p>
        )
        : (
          budgets
            .slice(0, 3)
            .map((budget) => (

              <BudgetItem

                key={
                  budget.id_budget
                }

                title={
                  budget.category_name
                }

                used={
                  budget.used_amount
                }

                limit={
                  budget.amount_limit
                }

              />

            ))
        )
      }

    </div>

  );

};

export default BudgetCard;