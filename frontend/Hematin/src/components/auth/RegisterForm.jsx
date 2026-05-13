import { useState } from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import AuthInput from "./AuthInput";

import {
  registerUser,
} from "../../services/authService";

const RegisterForm = () => {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      username: "",
      email_user: "",
      phone_number: "",
      password: "",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await registerUser(formData);

      alert("Register berhasil!");

      navigate("/login");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Register gagal"
      );

    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 shadow rounded"
      style={{ width: "350px" }}
    >

      <h2 className="mb-4 text-center">
        Register
      </h2>

      <AuthInput
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />

      <AuthInput
        type="email"
        name="email_user"
        placeholder="Email"
        value={formData.email_user}
        onChange={handleChange}
      />

      <AuthInput
        type="text"
        name="phone_number"
        placeholder="No Telepon"
        value={formData.phone_number}
        onChange={handleChange}
      />

      <AuthInput
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />

      <button className="btn btn-danger w-100 mb-3">
        Register
      </button>

      <p className="text-center m-0">

        Sudah punya akun?
        {" "}

        <Link to="/login">
          Login
        </Link>

      </p>

    </form>
  );
};

export default RegisterForm;