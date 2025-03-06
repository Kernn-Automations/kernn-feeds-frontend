import FinanceNavBg from "./FinanceNavBg";
import Logo from "./Logo";
import NavBg from "./NavBg";
import styles from "./NavContainer.module.css";
import ProductionNavBg from "./ProductionNavBg";
import SalesNavBg from "./SalesNavBg";
import StoresNavBg from "./StoresNavBg";
import VLPNavBg from "./VLPNavBg";
function NavContainer({hover, setTab, tab, role, dept}) {
  console.log(role)
  return (
    <>
      <Logo />
      {(dept === "procurement" && role !== "Village Agent" )&& <NavBg hover={hover} setTab={setTab} tab={tab} />}
      {(dept === "procurement" && role ==="Village Agent") && <VLPNavBg hover={hover} setTab={setTab} tab={tab} />}
      {dept === "production" && <ProductionNavBg hover={hover} setTab={setTab} tab={tab}/>}
      {dept === "sales" && <SalesNavBg hover={hover} setTab={setTab} tab={tab} /> }
      {dept === "stores" && <StoresNavBg hover={hover} setTab={setTab} tab={tab} />}
      {dept === "finance" && <FinanceNavBg hover={hover} setTab={setTab} tab={tab} />}
    </>
  );
}

export default NavContainer;
