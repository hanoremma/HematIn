import axios from "axios";

const API_URL =
  "http://localhost:3000/budget";

const normalizeBudgets = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.budgets)) return data.budgets;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/* =========================
   GET BUDGET
========================= */

export const getBudgets =
  async (id_user) => {

    const response =
      await axios.get(
        `${API_URL}/${id_user}`
      );

    return normalizeBudgets(response.data);

};

/* =========================
   ADD BUDGET
========================= */

export const addBudget =
  async (data) => {

    const response =
      await axios.post(
        API_URL,
        data
      );

    return response.data;

};

/* =========================
   UPDATE BUDGET
========================= */

export const updateBudget =
  async (
    id_budget,
    data
  ) => {

    const response =
      await axios.put(
        `${API_URL}/${id_budget}`,
        data
      );

    return response.data;

};

/* =========================
   DELETE BUDGET
========================= */

export const deleteBudget =
  async (id_budget) => {

    const response =
      await axios.delete(
        `${API_URL}/${id_budget}`
      );

    return response.data;

};
