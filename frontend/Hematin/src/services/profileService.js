import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const getProfile =
  async (token) => {

    const response =
      await axios.get(
        `${API_URL}/profile`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    return response.data;

  };

export const updateProfile =
  async (
    token,
    data
  ) => {

    const response =
      await axios.put(
        `${API_URL}/profile`,
        data,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    return response.data;

  };