import axios from "axios";

const API_URL = "http://localhost:3000";

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