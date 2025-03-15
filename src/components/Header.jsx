import styles from "./Login.module.css";
import bglogo from "../images/feeds-croped.png";
function Header() {
  return (
    <>
      <div className={` ${styles.logocol}`}>
        <img className={styles.logo} src={bglogo} alt="logo-bg" />
      </div>
      <div className={styles.wel}>
        <h1>Welcome !</h1>
      </div>
    </>
  );
}

export default Header;
