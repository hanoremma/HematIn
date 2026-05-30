import { useState, useEffect } from "react";

import Modal from "../../ui/Modal";

import TransactionForm from "../../transaction/TransactionForm";

import ReceiptModal from "../../receipt/ReceiptModal";

import BudgetForm from "../../budget/BudgetForm";

// API
import { addTransaction } from "../../../services/transactionService";

import {
  getCategories
} from "../../../services/categoryService";

import {
  getWallets
} from "../../../services/walletService";

import {addBudget } from "../../../services/budgetService";

const DashboardActions = () => {
  /* =========================
     MODAL STATE
  ========================= */

  const [showTransaction, setShowTransaction] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  

  /* =========================
     USER LOGIN
  ========================= */

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("USER LOGIN:", user);

  /* =========================
   FETCH DATA
========================= */

useEffect(() => {

  const fetchData =
    async () => {

      try {

        /* CATEGORY */

        const categoryData =
          await getCategories(
            user.id_user
          );

        console.log(
          "CATEGORY DATA:",
          categoryData
        );

        setCategories(
          categoryData
        );

        /* WALLET */

        const walletData =
          await getWallets(
            user.id_user
          );

        console.log(
          "WALLET DATA:",
          walletData
        );

        setWallets(
          walletData
        );

      } catch (error) {

        console.log(error);

      }

    };

  if (user?.id_user) {

    fetchData();

  }

}, [user?.id_user]);

  /* =========================
     TRANSACTION STATE
  ========================= */

  const [transactionData, setTransactionData] = useState({
    transactionType: "Pengeluaran",

    amount: "",

    description: "",

    transactionDate: "",

    wallet: "",

    category: "",
  });

  /* =========================
     BUDGET STATE
  ========================= */

  const [budgetData, setBudgetData] = useState({
    budgetType: "Pengeluaran",

    descriptionBudget: "",

    category: "",

    amountLimit: "",

    startDate: "",

    endDate: "",
  });

  /* =========================
     TRANSACTION HANDLER
  ========================= */

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;

    setTransactionData({
      ...transactionData,

      [name]: value,
    });
  };

  /* =========================
     TYPE HANDLER
  ========================= */

  const handleTypeChange = (type) => {
    setTransactionData({
      ...transactionData,

      transactionType: type,
    });
  };

  /* =========================
     SUBMIT TRANSACTION
  ========================= */

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        // USER LOGIN
        id_user: user.id_user,

        // UUID WALLET
        id_wallet: transactionData.wallet,

        // UUID CATEGORY
        id_category: transactionData.category,

        // OPTIONAL
        id_budget: null,

        // TYPE
        transaction_type: transactionData.transactionType,

        // NUMBER
        amount: Number(transactionData.amount),

        // DESC
        description: transactionData.description,

        // DATE
        transaction_date: transactionData.transactionDate,

        // SOURCE
        source: "Manual",
      };

      console.log(payload);

      // API
      await addTransaction(payload);

      alert("Transaction Saved!");

      // CLOSE MODAL
      setShowTransaction(false);

      // RESET FORM
      setTransactionData({
        transactionType: "Pengeluaran",

        amount: "",

        description: "",

        transactionDate: "",

        wallet: "",

        category: "",
      });
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Gagal tambah transaction");
    }
  };

  /* =========================
     BUDGET HANDLER
  ========================= */

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;

    setBudgetData({
      ...budgetData,

      [name]: value,
    });
  };

  /* =========================
     BUDGET TYPE
  ========================= */

  const handleBudgetTypeChange = (type) => {
    setBudgetData({
      ...budgetData,

      budgetType: type,
    });
  };

  /* =========================
     SUBMIT BUDGET
  ========================= */

  const handleBudgetSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const payload = {

        id_user:
          user.id_user,

        id_category:
          budgetData.category,

        amount_limit:
          Number(
            budgetData.amountLimit
          ),

        start_date:
          budgetData.startDate,

        end_date:
          budgetData.endDate,

        budget_type:
          budgetData.budgetType,

        description_budget:
          budgetData.descriptionBudget

      };

      console.log(
        "BUDGET PAYLOAD:",
        payload
      );

      await addBudget(
        payload
      );

      alert(
        "Budget Saved!"
      );

      setShowBudget(false);

      /* RESET */

      setBudgetData({

        budgetType:
          "Pengeluaran",

        descriptionBudget:
          "",

        category:
          "",

        amountLimit:
          "",

        startDate:
          "",

        endDate:
          "",

      });

    } catch (error) {

      console.log(error);

      alert(

        error?.response?.data?.message
        ||

        "Gagal tambah budget"

      );

    }

};
  return (
    <>
      {/* =========================
          ACTION BUTTON
      ========================= */}

      <div className="dashboard-actions">
        {/* TRANSACTION */}
        <button onClick={() => setShowTransaction(true)}>
          + Tambah Transaksi
        </button>

        {/* RECEIPT */}
        <button
  className="scan-btn"
  onClick={() => setShowReceipt(true)}
>
  <i className="bi bi-receipt"></i>
  <span>Scan Struk</span>
</button>
        {/* BUDGET */}
        <button onClick={() => setShowBudget(true)}>+ Tambah Budget</button>
      </div>

      {/* =========================
          TRANSACTION MODAL
      ========================= */}

      <Modal show={showTransaction} onClose={() => setShowTransaction(false)}>
        <TransactionForm
          formData={transactionData}
          wallets={wallets}
          categories={categories}
          handleChange={handleTransactionChange}
          handleTypeChange={handleTypeChange}
          handleSubmit={handleTransactionSubmit}
        />
      </Modal>

      {/* =========================
          BUDGET MODAL
      ========================= */}

      <Modal show={showBudget} onClose={() => setShowBudget(false)}>
        <BudgetForm
          formData={budgetData}
          categories={categories}
          handleChange={handleBudgetChange}
          handleTypeChange={handleBudgetTypeChange}
          handleSubmit={handleBudgetSubmit}
        />
      </Modal>

      {/* =========================
          RECEIPT MODAL
      ========================= */}

      <ReceiptModal show={showReceipt} onClose={() => setShowReceipt(false)} />
    </>
  );
};

export default DashboardActions;
