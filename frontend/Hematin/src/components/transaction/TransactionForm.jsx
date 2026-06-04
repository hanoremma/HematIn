import { useEffect, useState } from "react";

import TransactionTypeToggle from "./TransactionTypeToggle";

import {
  getCategories
} from "../../services/categoryService";

import {
  getWallets
} from "../../services/walletService";

import "../../styles/css/Transaction.css";

const TransactionForm = ({
  formData,
  handleChange,
  handleTypeChange,
  handleSubmit,
  isEdit = false,
  suggestedCategoryName = "",
}) => {

  /* =========================
     USER LOGIN
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /* =========================
     CATEGORY STATE
  ========================= */

  const [categories, setCategories] =
    useState([]);

  /* =========================
     WALLET STATE
  ========================= */

  const [wallets, setWallets] =
    useState([]);

  const handleAmountChange = (e) => {

  const value =
    e.target.value.replace(
      /\D/g,
      ""
    );

  handleChange({

    target: {

      name: "amount",

      value

    }

  });

};

const formatNumber = (value) => {

  if (!value) return "";

  return Number(value)
    .toLocaleString("id-ID");

};

  /* =========================
     FETCH CATEGORY
  ========================= */

  useEffect(() => {

    const fetchCategories =
      async () => {

        try {

          // USER BELUM LOGIN
          if (!user?.id_user) {

            console.log(
              "USER CATEGORY TIDAK ADA"
            );

            return;

          }

          const data =
            await getCategories(
              user.id_user
            );

          console.log(
            "CATEGORIES:",
            data
          );

          setCategories(data);

        } catch (error) {

          console.log(error);

        }

      };

    fetchCategories();

  }, [user?.id_user]);

  // Auto-select kategori dari hasil OCR
  useEffect(() => {
    if (
      !suggestedCategoryName ||
      categories.length === 0 ||
      formData.category
    ) return;

    const match = categories.find(
      (c) =>
        c.category_name.toLowerCase() ===
        suggestedCategoryName.toLowerCase()
    );

    if (match) {
      handleChange({
        target: {
          name: "category",
          value: match.id_category,
        },
      });
    }
  }, [categories, suggestedCategoryName]);

  /* =========================
     FETCH WALLET
  ========================= */

  useEffect(() => {

    const fetchWallets =
      async () => {

        try {

          // USER BELUM LOGIN
          if (!user?.id_user) {

            console.log(
              "USER WALLET TIDAK ADA"
            );

            return;

          }

          const data =
            await getWallets(
              user.id_user
            );

          console.log(
            "WALLETS:",
            data
          );

          setWallets(data);

        } catch (error) {

          console.log(error);

        }

      };

    fetchWallets();

  }, [user?.id_user]);

  return (

    <form
      className="transaction-form"
      onSubmit={handleSubmit}
    >

      <h2 className="form-title">
        {isEdit ? "Edit Transaction" : "Tambah Transaction"}
      </h2>

      {/* TRANSACTION TYPE */}

      <div className="form-group">

        <label>
          Tipe Transaksi
        </label>

        <TransactionTypeToggle
          value={
            formData.transactionType
          }
          onChange={
            handleTypeChange
          }
        />

      </div>

      {/* AMOUNT */}

      <div className="form-group">

        <label>
          Jumlah
        </label>

        <input
          type="text"
          name="amount"
          placeholder="Masukkan jumlah transaksi"
          value={
            formatNumber(formData.amount)}
          onChange={handleAmountChange}
          required
        />

      </div>

      {/* DESCRIPTION */}

      <div className="form-group">

        <label>
          Deskripsi
        </label>

        <input
          type="text"
          name="description"
          placeholder="Masukkan deskripsi transaksi"
          value={formData.description}
          onChange={handleChange}
          required
        />

      </div>

      {/* DATE */}

      <div className="form-group">

        <label>
          Tanggal Transaksi
        </label>

        <input
          type="datetime-local"
          name="transactionDate"
          value={
            formData.transactionDate
          }
          onChange={handleChange}
          required
        />

      </div>

      {/* WALLET */}

      <div className="form-group">

        <label>
          Wallet
        </label>

        <select
          name="wallet"
          value={formData.wallet}
          onChange={handleChange}
          required
        >

          <option value="">
            Pilih Wallet
          </option>

          {wallets.length > 0 ? (

            wallets.map((wallet) => (

              <option
                key={wallet.id_wallet}
                value={wallet.id_wallet}
              >

                {wallet.wallet_name}

              </option>

            ))

          ) : (

            <option disabled>
              Wallet belum tersedia
            </option>

          )}

        </select>

      </div>

      {/* CATEGORY */}

      <div className="form-group">

        <label>
          Kategori
        </label>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >

          <option value="">
            Pilih Kategori
          </option>

          {categories.length > 0 ? (

            categories.map((category) => (

              <option
                key={category.id_category}
                value={category.id_category}
              >

                {category.category_name}

              </option>

            ))

          ) : (

            <option disabled>
              Kategori belum tersedia
            </option>

          )}

        </select>

      </div>

      {/* SUBMIT */}

      <button
      type="submit"
      className="submit-btn"
      >
        {isEdit
        ? "Update Transaksi"
        : "Simpan Transaksi"}
        </button>

    </form>

  );

};

export default TransactionForm;