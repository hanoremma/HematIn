import { Routes, Route } from "react-router-dom";

import MainLayouts from "./layouts/MainLayouts";
import AppLayouts from "./layouts/AppLayouts";

import HomePage from "./pages/HomePage";
import FiturePage from "./pages/FiturePage";
import TestimonialPage from "./pages/TestimonialPage";
import ToSPage from "./pages/ToSPage";
import FaqPage from "./pages/FaqPage";

import DashboardPage from "./pages/Dashboard/DashboardPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddTransactionPage from "./pages/transaction/AddTransactionPage";
import AddBudgetPage from "./pages/budget/AddBudgetPage";
import TransactionPage from "./pages/transaction/TransactionPage";
import WalletPage from "./pages/wallet/WalletPage";
import BudgetPage from "./pages/budget/BudgetPage";
import CategoriesPage from "./pages/category/CategoriesPage";
import AddCategoryPage from "./pages/category/AddCategoryPage";
import ProfilePage from "./pages/profile/ProfilePage";


function App() {
  return (
    <Routes>

      {/* LANDING PAGE */}
      <Route element={<MainLayouts />}>

        <Route path="/" element={<HomePage />} />
        <Route path="/fiture" element={<FiturePage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/tos" element={<ToSPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

      </Route>

      {/* APPLICATION / DASHBOARD */}
      <Route element={<AppLayouts />}>

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallets" element={<WalletPage />} />
        <Route path="/transactions/add" element={<AddTransactionPage />}/>
        <Route path="/budgets/add" element={<AddBudgetPage />}/>
        <Route path="/transactions" element={<TransactionPage />}/>
        <Route path="/budgets" element={<BudgetPage />}/>
        <Route path="/categories" element={<CategoriesPage />}/>
        <Route path="/categories/add" element={<AddCategoryPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>

      </Route>

    </Routes>
  );
}

export default App;