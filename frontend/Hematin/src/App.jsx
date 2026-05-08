import {Routes, Route, useLocation} from 'react-router-dom'

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from './pages/Dashboard/DashboardPage';

import NavbarComponent from './components/NavbarComponent'
import FooterComponent from './components/FooterComponent'

import HomePage from './pages/HomePage'
import FiturePage from './pages/FiturePage'
import TestimonialPage from './pages/TestimonialPage'
import ToSPage from './pages/ToSPage'
import FaqPage from './pages/FaqPage'

function App() {
  const location = useLocation();

  const hideLayout =
  location.pathname === "/dashboard" 
  return(
    <div>
      {!hideLayout && <NavbarComponent />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fiture" element={<FiturePage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/tos" element={<ToSPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      {!hideLayout && <FooterComponent />}
    </div>
      )
    }

export default App
