import NavBg from "./NavBg";

function NavContainer({hover, setTab, tab, role, dept, closeMobileMenu}) {
  // console.log(role)
  return (
    <>
       <NavBg hover={hover} setTab={setTab} tab={tab} closeMobileMenu={closeMobileMenu} />
      {/* {(dept === "procurement" && role ==="Village Agent") && <VLPNavBg hover={hover} setTab={setTab} tab={tab} />}
      {dept === "production" && <ProductionNavBg hover={hover} setTab={setTab} tab={tab}/>}
      {dept === "sales" && <SalesNavBg hover={hover} setTab={setTab} tab={tab} /> }
      {dept === "stores" && <StoresNavBg hover={hover} setTab={setTab} tab={tab} />}
      {dept === "finance" && <FinanceNavBg hover={hover} setTab={setTab} tab={tab} />} */}
    </>
  );
}

export default NavContainer;
