import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/wallet`;

// =========================
// GET WALLET TYPES
// =========================
export const getWalletTypes =
  async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/types`
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

// =========================
// GET WALLET BY USER
// =========================
export const getWallets =
  async (id_user) => {

    try {

      const response =
        await axios.get(
          `${API_URL}/${id_user}`
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

// =========================
// ADD WALLET
// =========================
export const addWallet =
  async (data) => {

    try {

      const response =
        await axios.post(
          API_URL,
          data
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

// =========================
// UPDATE WALLET
// =========================
export const updateWallet =
  async (id_wallet, data) => {

    try {

      const response =
        await axios.put(
          `${API_URL}/${id_wallet}`,
          data
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

// =========================
// DELETE WALLET
// =========================
export const deleteWallet =
  async (id_wallet) => {

    try {

      const response =
        await axios.delete(
          `${API_URL}/${id_wallet}`
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};