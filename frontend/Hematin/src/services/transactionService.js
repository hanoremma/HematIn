import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/transaction`;

/* =========================
   ADD TRANSACTION
========================= */

export const addTransaction =
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

/* =========================
   GET TRANSACTIONS
========================= */

export const getTransactions =
  async (id_user) => {

    try {

      const response =
        await axios.get(
          `${API_URL}/${id_user}`
        );

      return response.data;

    } catch (error) {

      console.log(error);

      return [];

    }

};

export const updateTransaction =
  async (id, data) => {

    try {

      const response =
        await axios.put(
          `${API_URL}/${id}`,
          data
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

/* =========================
   DELETE TRANSACTION
========================= */

export const deleteTransaction =
  async (id_transaction) => {

    try {

      const response =
        await axios.delete(
          `${API_URL}/${id_transaction}`
        );

      return response.data;

    } catch (error) {

      console.log(error);

      throw error;

    }

};

