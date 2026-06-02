import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "../../dist/css/Transaction.css";

import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";

import TransactionForm
from "../../components/transaction/TransactionForm";

import TransactionTable
from "../../components/transaction/TransactionTable";

import ReceiptModal
from "../../components/receipt/ReceiptModal";

import {
  addTransaction
} from "../../services/transactionService";

import { getTransactions } from "../../services/transactionService";

import {updateTransaction} from "../../services/transactionService";

import {deleteTransaction} from "../../services/transactionService";

const TransactionPage = () => {

  /* =========================
     MODAL STATE
  ========================= */

  const [showTransaction,
    setShowTransaction] =
    useState(false);

  const [showReceipt,
    setShowReceipt] =
    useState(false);

  /* =========================
     TRANSACTION TABLE STATE
  ========================= */

  const [transactions,
    setTransactions] =
    useState([]);

  const [typeFilter,
    setTypeFilter] =
    useState("All");

  const [sourceFilter,
    setSourceFilter] =
    useState("All");

  const [search,
    setSearch] =
    useState("");

  const [isEdit, setIsEdit] =
  useState(false);
  
  const [selectedTransaction,
    setSelectedTransaction] =
    useState(null);

  const [showDeleteModal,
    setShowDeleteModal] =
    useState(false);

  const [transactionToDelete,
    setTransactionToDelete] =
    useState(null);

  /* =========================
     FORM STATE
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [formData,
    setFormData] =
    useState({
      transactionType: "Pengeluaran",
      amount: "",
      description: "",
      transactionDate: "",
      wallet: "",
      category: "",
    });

    /* =========================
   FETCH TRANSACTIONS
========================= */

/* =========================
   FETCH TRANSACTIONS
========================= */

const fetchTransactions =
  useCallback(async () => {

    try {

      if (!user?.id_user) return;

      const data =
        await getTransactions(
          user.id_user
        );

      setTransactions(data);

    } catch (error) {

      console.log(error);

    }

  }, [user?.id_user]);

/* =========================
   USE EFFECT
========================= */

useEffect(() => {

  const load = async () => {
    await fetchTransactions();
  };

  load();

}, [fetchTransactions]);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

  };

  /* =========================
     HANDLE TYPE
  ========================= */

  const handleTypeChange = (type) => {

    setFormData({
      ...formData,
      transactionType: type,
    });

  };

  const resetTransactionForm = () => {

    setIsEdit(false);

    setSelectedTransaction(null);

    setFormData({

      transactionType:
        "Pengeluaran",

      amount: "",

      description: "",

      transactionDate: "",

      wallet: "",

      category: "",

    });

  };

  const handleOpenAdd = () => {

    resetTransactionForm();

    setShowTransaction(true);

  };

  const handleCloseTransaction = () => {

    setShowTransaction(false);

    resetTransactionForm();

  };

/* =========================
   HANDLE SUBMIT
========================= */

const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const payload = {

        id_user:
          user.id_user,

        id_wallet:
          formData.wallet,

        id_category:
          formData.category,

        id_budget:
          null,

        transaction_type:
          formData.transactionType,

        amount:
          Number(formData.amount),

        description:
          formData.description,

        transaction_date:
          formData.transactionDate,

        source:
          "Manual"

      };

      console.log(payload);

      /* =========================
         EDIT TRANSACTION
      ========================= */

      if (isEdit) {

        console.log(payload);

        await updateTransaction(

          selectedTransaction
            .id_transaction,

          payload

        );

await fetchTransactions();

        toast.success(
          "Transaction updated"
        );

      }

      /* =========================
         ADD TRANSACTION
      ========================= */

      else {

        const result =
          await addTransaction(
            payload
          );

        console.log(result);

        await fetchTransactions();

        toast.success(
          "Transaction added"
        );

      }

      /* =========================
         RESET FORM
      ========================= */

      handleCloseTransaction();

    } catch (error) {

      console.log(error);

      toast.error(
        "Gagal simpan transaction"
      );

    }

};;

/* =========================
   HANDLE DELETE
========================= */

const handleDelete =
  async (id_transaction) => {

    const transaction =
      transactions.find(
        (item) =>
          item.id_transaction === id_transaction
      );

    setTransactionToDelete(
      transaction ?? { id_transaction }
    );

    setShowDeleteModal(true);

};

const handleCloseDeleteModal = () => {

  setShowDeleteModal(false);
  setTransactionToDelete(null);

};

const handleConfirmDelete =
  async () => {

    if (!transactionToDelete?.id_transaction)
      return;

    try {

      await deleteTransaction(
        transactionToDelete.id_transaction
      );

      const filtered =
        transactions.filter(
          (item) =>

            item.id_transaction !==
            transactionToDelete.id_transaction
        );

      setTransactions(filtered);

      toast.success(
        "Transaction deleted"
      );

      handleCloseDeleteModal();

    } catch (error) {

      console.log(error);

      toast.error(
        "Gagal hapus transaction"
      );

    }

};



  /* =========================
     FILTER DATA
  ========================= */

  const filteredTransactions =
    transactions.filter((item) => {

      const matchType =
        typeFilter === "All"
        || item.transaction_type ===
        typeFilter;

      const matchSource =
        sourceFilter === "All"
        || item.source ===
        sourceFilter;

      const matchSearch =
        item.description
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchType
        && matchSource
        && matchSearch
      );

    });

    const handleEdit = (data) => {
      setSelectedTransaction(data);
      setFormData({
        transactionType:
        data.transaction_type,
        
        amount:
        data.amount,
        
        description:
        data.description,
        
        transactionDate:
        data.transaction_date ?.slice(0,16),
        
        wallet:
        data.id_wallet,
        
        category:
        data.id_category,
  });

  setIsEdit(true);

  setShowTransaction(true);

};

  return (
    <div className="transaction-page">

      {/* HEADER */}

      <div className="transaction-header">

        <div className="transaction-header-left">

  <div className="transaction-title">

    <i className="bi bi-receipt"></i>

    <h2>Transaksi</h2>

  </div>

  <p className="transaction-subtitle">
    Kelola transaksi keuangan
  </p>

</div>

        {/* ACTION BUTTON */}

        <div className="transaction-actions">

          <button
            className="add-btn"
            onClick={handleOpenAdd}
          >
            + Tambah Transaksi
          </button>

          <button
            className="scan-btn"
            onClick={() =>
              setShowReceipt(true)
            }
          >
            <i className="bi bi-receipt-cutoff"></i>
  <span>Scan Struk</span>
          </button>

        </div>

      </div>

      {/* TOOLBAR */}

      <div className="transaction-toolbar">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Cari transaksi..."
          className="transaction-search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* TYPE FILTER */}

        <select
          className="transaction-filter"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >

          <option value="All">
            Semua Tipe
          </option>

          <option value="Pengeluaran">
            Pengeluaran
          </option>

          <option value="Pemasukan">
            Pemasukan
          </option>

        </select>

        {/* SOURCE FILTER */}

        <select
          className="transaction-filter"
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value)
          }
        >

          <option value="All">
            Semua Source
          </option>

          <option value="Manual">
            Manual
          </option>

          <option value="Scan">
            Scan
          </option>

        </select>

      </div>

      {/* TABLE */}

      <TransactionTable
        transactions={
          filteredTransactions
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* TRANSACTION MODAL */}

      <Modal
        show={showTransaction}
        onClose={handleCloseTransaction}
      >

        <TransactionForm
          formData={formData}
          handleChange={handleChange}
          handleTypeChange={handleTypeChange}
          handleSubmit={handleSubmit}
          isEdit={isEdit}
        />

      </Modal>

      {/* RECEIPT MODAL */}

      <ReceiptModal
        show={showReceipt}
        onClose={() =>
          setShowReceipt(false)
        }
      />

      <ConfirmModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={
          transactionToDelete?.description
            ? `Yakin ingin menghapus transaksi ${transactionToDelete.description}?`
            : "Yakin ingin menghapus transaksi ini?"
        }
      />

    </div>
  );

};

export default TransactionPage;
