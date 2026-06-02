import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const registerUser = async (data) => {
  const response = await axios.post(
    `${API_URL}/register`,
    data
  );

  return response.data;
};

export const loginUser = async (data) => {
  const response = await axios.post(
    `${API_URL}/login`,
    data
  );

  return response.data;
};