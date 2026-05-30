import axios from "axios";

const API_URL =
  "http://localhost:3000/transaction-img";

export const uploadTransactionImage =
  async (file) => {

    const token =
      localStorage.getItem(
        "token"
      );

    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    const response =
      await axios.post(
        API_URL,
        formData,
        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "multipart/form-data"

          }
        }
      );

    return response.data;

  };