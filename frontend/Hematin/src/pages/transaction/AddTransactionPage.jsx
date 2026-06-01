import { useState } from "react";

import TransactionForm
from "../../components/transaction/TransactionForm";

import {
  addTransaction,
} from "../../services/transactionService";

const initialFormData = {
  transactionType: "Pengeluaran",
  amount: "",
  description: "",
  transactionDate: "",
  wallet: "",
  category: "",
};

const AddTransactionPage = () => {

  const [formData, setFormData] =
    useState(initialFormData);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  /* =========================
     HANDLE TYPE CHANGE
  ========================= */

  const handleTypeChange = (type) => {

    setFormData((prev) => ({
      ...prev,
      transactionType: type,
    }));

  };

  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        /* VALIDATION */

        if (
          !formData.amount ||
          !formData.description ||
          !formData.transactionDate ||
          !formData.wallet ||
          !formData.category
        ) {

          alert(
            "Semua field wajib diisi"
          );

          return;

        }

        /* PAYLOAD */

        const payload = {

          id_user: 1,

          id_wallet:
            formData.wallet,

          id_category:
            formData.category,

          id_budget: 1,

          transaction_type:
            formData.transactionType,

          amount:
            Number(formData.amount),

          description:
            formData.description,

          transaction_date:
            formData.transactionDate,

          source: "Manual",

        };

        console.log(
          "PAYLOAD:",
          payload
        );

        /* API CALL */

        const result =
          await addTransaction(
            payload
          );

        console.log(
          "RESULT:",
          result
        );

        alert(
          "Transaction berhasil ditambahkan"
        );

        /* RESET FORM */

        setFormData(initialFormData);

      } catch (error) {

        console.log(
          "ERROR:",
          error
        );

        alert(
          error?.response?.data?.message
          || "Gagal tambah transaction"
        );

      }

    };

  return (

    <div className="page-container">

      <TransactionForm
        formData={formData}
        handleChange={handleChange}
        handleTypeChange={handleTypeChange}
        handleSubmit={handleSubmit}
        isEdit={false}
      />

    </div>

  );

};

export default AddTransactionPage;