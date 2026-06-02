import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/category`;

/* =========================
   GET CATEGORY
========================= */

export const getCategories =
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

/* =========================
   ADD CATEGORY
========================= */

export const addCategory =
  async (data) => {

    const response =
      await axios.post(
        API_URL,
        data
      );

    return response.data;

};

/* =========================
   DELETE CATEGORY
========================= */

export const deleteCategory =
  async (id_category) => {

    const response =
      await axios.delete(
        `${API_URL}/${id_category}`
      );

    return response.data;

};

/* =========================
   UPDATE CATEGORY
========================= */

export const updateCategory =
  async (
    id_category,
    data
  ) => {

    const response =
      await axios.put(
        `${API_URL}/${id_category}`,
        data
      );

    return response.data;

};