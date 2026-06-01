import TransactionItem
from "./TransactionItem";

const TransactionList = ({
  transactions
}) => {

  return (

    <div className="transaction-list-card">

      <div className="transaction-header">

        <h4>
          Transaksi Terakhir
        </h4>

      </div>

      {
        transactions.length === 0
        ? (
          <p>
            Belum ada transaksi
          </p>
        )
        : (
          transactions.map((item) => (

            <TransactionItem
            key={item.id_transaction}
            title={item.description}
            date={
              new Date(
                item.transaction_date
              ).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
            }
            amount={item.amount}
            type={item.transaction_type}
            />

          ))
        )
      }

    </div>

  );

};

export default TransactionList;