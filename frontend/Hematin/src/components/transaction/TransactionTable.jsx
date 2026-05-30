import "../../dist/css/Transaction.css";

const TransactionTable = ({
  transactions,
  onEdit,
  onDelete
}) => {

  return (
    <div className="transaction-table-wrapper">
    <table className="transaction-table">

      <thead>

        <tr>

          <th>No</th>
          <th>Type</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Wallet</th>
          <th>Date</th>
          <th>Source</th>
          <th>Action</th>

        </tr>

      </thead>

      <tbody>

        {
          transactions.length === 0
          ? (
            <tr>

              <td
                colSpan="9"
                className="empty-table"
              >
                Belum ada transaksi
              </td>

            </tr>
          )
          : (
            transactions.map(
              (item, index) => (

              <tr key={index}>

                <td>{index + 1}</td>

                <td>
                  {item.transaction_type}
                </td>

                <td>
                  {item.description}
                </td>

                <td>
                  {item.category_name}
                </td>

                <td>
                  Rp {item.amount}
                </td>

                <td>
                  {item.wallet_name}
                </td>

                <td>
                  {
            new Date(
              item.transaction_date
            ).toLocaleDateString()
          }
                </td>

                <td>
                  {item.source}
                </td>

                <td>
<div className="table-actions">

    <button
      className="edit-btn"
      onClick={() =>
        onEdit(item)
      }
    >
      Edit
    </button>

    <button
      className="delete-btn"
      onClick={() =>
        onDelete(
          item.id_transaction
        )
      }
    >
      Delete
    </button>

  </div>
                    </td>

              </tr>

            ))
          )
        }

      </tbody>

    </table>
    </div>
  );
};

export default TransactionTable;