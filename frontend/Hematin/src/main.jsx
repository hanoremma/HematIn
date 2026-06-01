import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './dist/css/main.css'
import 'animate.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ScrollToTop />
      <App />
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
)
