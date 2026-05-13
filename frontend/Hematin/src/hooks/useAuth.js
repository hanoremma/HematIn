import { useState } from "react";

const useAuth = () => {

  const [user, setUser] = useState(() => {

    const data =
      localStorage.getItem("user");

    return data
      ? JSON.parse(data)
      : null;

  });

  const login = (data) => {

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    setUser(data.user);
  };

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    window.location.href = "/login";
  };

  return {
    user,
    login,
    logout,
  };
};

export default useAuth;