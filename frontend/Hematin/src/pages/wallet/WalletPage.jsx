import { useState, useEffect, useCallback } from "react";

import Modal from "../../components/ui/Modal";

import WalletForm
  from "../../components/wallet/WalletForm";

import WalletCard
  from "../../components/wallet/WalletCard";

import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "../../services/walletService";

const EMPTY_FORM = {
  wallet_name: "",
  wallet_type: "",
  balance: "",
};

const WalletPage = () => {

  /* =========================
     USER
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /* =========================
     STATE
  ========================= */

  const [wallets, setWallets] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [selectedWallet, setSelectedWallet] =
    useState(null);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  /* =========================
     FETCH WALLETS
  ========================= */

  const fetchWallets = useCallback(async () => {

    try {

      if (!user?.id_user) return;

      const data =
        await getWallets(user.id_user);

      setWallets(data);

    } catch (error) {

      console.log(error);

    }

  }, [user?.id_user]);

  useEffect(() => {

    const load = async () => {
      await fetchWallets();
    };

    load();

  }, [fetchWallets]);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  /* =========================
     OPEN ADD MODAL
  ========================= */

  const handleOpenAdd = () => {

    setIsEdit(false);
    setSelectedWallet(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);

  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const handleEdit = (wallet) => {

    setIsEdit(true);
    setSelectedWallet(wallet);
    setFormData({
      wallet_name: wallet.wallet_name,
      wallet_type: wallet.wallet_type,
      balance: wallet.balance,
    });
    setShowModal(true);

  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const handleCloseModal = () => {

    setShowModal(false);
    setIsEdit(false);
    setSelectedWallet(null);
    setFormData(EMPTY_FORM);

  };

  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (isEdit) {

        await updateWallet(
          selectedWallet.id_wallet,
          {
            wallet_name: formData.wallet_name,
            balance: Number(formData.balance),
            wallet_type: formData.wallet_type,
          }
        );

      } else {

        await addWallet({
          id_user: user.id_user,
          wallet_name: formData.wallet_name,
          balance: Number(formData.balance),
          wallet_type: formData.wallet_type,
        });

      }

      handleCloseModal();
      await fetchWallets();

    } catch (error) {

      console.log(error);
      alert("Gagal menyimpan wallet");

    }

  };

  /* =========================
     HANDLE DELETE
  ========================= */

  const handleDelete = async (id_wallet) => {

    const confirmed = window.confirm(
      "Yakin ingin menghapus wallet ini?"
    );

    if (!confirmed) return;

    try {

      await deleteWallet(id_wallet);
      await fetchWallets();

    } catch (error) {

      console.log(error);
      alert("Gagal menghapus wallet");

    }

  };

  /* =========================
     TOTAL BALANCE
  ========================= */

  const totalBalance = wallets.reduce(
    (sum, w) => sum + Number(w.balance),
    0
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="transaction-page">

      {/* HEADER */}
      <div className="transaction-header">

        <div className="wallet-title">

          <i className="bi bi-wallet2"></i>

          <div>
          <h2>Wallets</h2>

          <p>
            Total Balance: Rp{" "}
            {totalBalance.toLocaleString("id-ID")}
          </p>

          </div>

        </div>

        <button
          className="add-btn"
          onClick={handleOpenAdd}
        >
          + Tambah Wallet
        </button>

      </div>

      {/* WALLET CARDS */}
      {wallets.length === 0 ? (

        <p className="empty-table">
          Belum ada wallet. Tambahkan wallet pertamamu!
        </p>

      ) : (

        <div className="wallet-grid">

          {wallets.map((wallet) => (

            <WalletCard
              key={wallet.id_wallet}
              wallet={wallet}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          ))}

        </div>

      )}

      {/* MODAL */}
      <Modal
        show={showModal}
        onClose={handleCloseModal}
        title=''
      >

        <WalletForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isEdit={isEdit}
          onCancel={handleCloseModal}
        />

      </Modal>

    </div>
  );

};

export default WalletPage;
