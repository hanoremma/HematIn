const TYPE_ICON = {
  Cash: "bi-cash-stack",
  Bank: "bi-bank",
  "E-Wallet": "bi-phone",
  "Credit Card": "bi-credit-card",
  Investment: "bi-graph-up-arrow",
  Other: "bi-wallet2",
};

const WalletCard = ({
  wallet,
  onEdit,
  onDelete
}) => {

  return (

    <div className="wallet-card">

      {/* ICON & NAME */}
      <div className="wallet-card-header">

        <span className={`wallet-card-icon ${wallet.wallet_type}`}>

          <i
            className={
              `bi ${
                TYPE_ICON[
                  wallet.wallet_type
                ] ??
                "bi-wallet2"
              }`
            }
          ></i>

        </span>

        <div>

          <p className="wallet-card-name">
            {wallet.wallet_name}
          </p>

          <p className="wallet-card-type">
            {wallet.wallet_type}
          </p>

        </div>

      </div>

      {/* BALANCE */}
      <p className="wallet-card-balance">

        Rp {
          Number(
            wallet.balance
          ).toLocaleString(
            "id-ID"
          )
        }

      </p>

      {/* ACTIONS */}
      <div className="table-actions">

        <button
          className="edit-btn"
          onClick={() =>
            onEdit(wallet)
          }
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={() =>
            onDelete(
              wallet.id_wallet
            )
          }
        >
          Delete
        </button>

      </div>

    </div>

  );

};

export default WalletCard;