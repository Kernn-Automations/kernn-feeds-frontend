import { useState, useEffect } from "react";
import Logo from "./Logo";
import NavBg from "./NavBg";

function NavContainer({hover, setTab, tab, role, dept, closeMobileMenu}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
       {!isMobile && <Logo />}
       <NavBg hover={hover} setTab={setTab} tab={tab} closeMobileMenu={closeMobileMenu} />
    </>
  );
}

export default NavContainer;

