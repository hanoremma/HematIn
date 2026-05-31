import axios from "axios";

const API_URL =
  "http://localhost:3000/dashboard";

/* =========================
   GET DASHBOARD CARD
========================= */

export const getDashboard =
  async (id_user) => {

    const response =
      await axios.get(
        `${API_URL}/${id_user}`
      );

    return response.data;

};

/* =========================
   GET DASHBOARD ANALYTICS
========================= */

export const getDashboardAnalytics =
  async (id_user) => {

    const response =
      await axios.get(
        `${API_URL}/analytics/${id_user}`
      );

    return response.data;

};