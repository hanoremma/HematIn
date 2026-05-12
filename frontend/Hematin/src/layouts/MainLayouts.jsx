import NavbarComponent from '../components/NavbarComponent'
import FooterComponent from '../components/FooterComponent'
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <NavbarComponent />

      <Outlet />

      <FooterComponent />
    </>
  );
};

export default MainLayout;