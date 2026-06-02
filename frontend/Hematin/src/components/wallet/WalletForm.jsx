import { useState, useEffect } from "react";

import { getWalletTypes } from "../../services/walletService";

const WalletForm = ({
  formData,
  handleChange,
  handleSubmit,
  isEdit,
  onCancel,
}) => {

  const [walletTypes, setWalletTypes] =
    useState([]);

  useEffect(() => {

    const fetchTypes = async () => {

      try {

        const data = await getWalletTypes();
        setWalletTypes(data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchTypes();

  }, []);

  return (
    <form
      className="budget-form"
      onSubmit={handleSubmit}
    >

      <h2 className="form-title">
        {isEdit ? "Edit Wallet" : "Add Wallet"}
      </h2>

      {/* WALLET NAME */}
      <div className="form-group">

        <label>Nama Wallet</label>

        <input
          type="text"
          name="wallet_name"
          placeholder="Masukkan nama wallet"
          value={formData.wallet_name}
          onChange={handleChange}
          required
        />

      </div>

      {/* WALLET TYPE */}
      <div className="form-group">

        <label>Tipe Wallet</label>

        <select
          name="wallet_type"
          value={formData.wallet_type}
          onChange={handleChange}
          required
        >

          <option value="">
            Pilih Tipe Wallet
          </option>

          {walletTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}

        </select>

      </div>

      {/* BALANCE */}
      <div className="form-group">

        <label>
          {isEdit ? "Saldo" : "Isi Saldo Awal"}
        </label>

        <input
          type="number"
          name="balance"
          placeholder={isEdit ? "Enter balance" : "Isi saldo awal"}
          value={formData.balance}
          onChange={handleChange}
          min="0"
          required
        />

      </div>

      {/* ACTIONS */}
      <div className="form-actions">

        <button
          type="submit"
          className="submit-btn"
        >
          {isEdit ? "Update Wallet" : "Add Wallet"}
        </button>

        <button
          type="button"
          className="cancel-btn"
          onClick={onCancel}
        >
          Cancel
        </button>

      </div>

    </form>
  );

};

export default WalletForm;
