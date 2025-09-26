import Logo from "../Dashboard/navs/Logo";
import StoreNavBg from "./StoreNavBg";

function StoreNavContainer({ hover, setTab, tab }) {
  return (
    <>
      <Logo />
      <StoreNavBg hover={hover} setTab={setTab} tab={tab} />
    </>
  );
}

export default StoreNavContainer;


