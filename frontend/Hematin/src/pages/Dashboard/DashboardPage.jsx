import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  // const isLogin = localStorage.getItem("isLogin");

  // if (!isLogin) {
  //   return <Navigate to="/login" />;
  // }

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-page">

      <h1>Dashboard</h1>

      <h3>
        Selamat datang, {user?.name}
      </h3>

      <button
        className="btn btn-danger mt-3"
        onClick={() => {
          localStorage.removeItem("isLogin");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>

    </div>
  );
};

export default DashboardPage;