import { useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import {
  loginUser
} from "../../services/authService";

const LoginForm = () => {

  const { login } = useAuth();

  const [formData, setFormData] =
    useState({
      email_user: "",
      password: "",
    });

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const data = await loginUser({
        email_user: formData.email_user,
        password: formData.password,
      });

      console.log(data);

      login(data);

      window.location.href =
        "/dashboard";

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Login gagal"
      );

    }
  };

  return (
    <form onSubmit={handleLogin}>

      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={formData.email_user}
        onChange={(e) =>
          setFormData({
            ...formData,
            email_user: e.target.value
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) =>
          setFormData({
            ...formData,
            password: e.target.value
          })
        }
      />

      <button type="submit">
        Login
      </button>

      <p className="text-center mt-3">

        Belum memiliki akun?
        {" "}

        <Link to="/register">
          Daftar
        </Link>

      </p>

    </form>
  );
};

export default LoginForm;