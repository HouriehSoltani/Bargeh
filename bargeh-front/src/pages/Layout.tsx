import { Outlet } from "react-router-dom";
import { useEffect } from "react";

const Layout = () => {
  useEffect(() => {
    // Always set Persian language and RTL direction
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
    
    // Add RTL class for styling
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  }, []);

  return <Outlet />;
};

export default Layout;
