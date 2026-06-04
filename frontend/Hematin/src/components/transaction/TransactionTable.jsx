import "../../styles/css/Transaction.css";

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
          <th>Tipe</th>
          <th>Deskripsi</th>
          <th>Kategori</th>
          <th>Jumlah</th>
          <th>Wallet</th>
          <th>Tanggal</th>
          <th>Sumber</th>
          <th>Aksi</th>

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
                  {item.wallet_name ?? "-"}
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
      Hapus
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