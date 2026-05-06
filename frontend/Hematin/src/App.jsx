import {Routes, Route} from 'react-router-dom'

import NavbarComponent from './components/NavbarComponent'
import FooterComponent from './components/FooterComponent'

import HomePage from './pages/HomePage'
import FiturePage from './pages/FiturePage'
import TestimonialPage from './pages/TestimonialPage'
import ToSPage from './pages/ToSPage'
import FaqPage from './pages/FaqPage'

function App() {
  return(
    <div>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fiture" element={<FiturePage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/tos" element={<ToSPage />} />
      </Routes>
      <FooterComponent />
    </div>
      )
    }

export default App
