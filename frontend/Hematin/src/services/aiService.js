import axios from "axios";

const API_URL =import.meta.env.VITE_API_URL;

export const getRecommendation = async () => {

  const token =
    localStorage.getItem("token");

  const response =
    await axios.get(
      `${API_URL}/recommendation`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return response.data;
};