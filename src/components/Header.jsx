import styles from "./Login.module.css";
import bglogo from "../images/logo-bg3.png";
function Header() {
  return (
    <>
      <div className="row mb-3 justify-content-center">
        <div className={`col-6 ${styles.logocol}`}>
          <img className={styles.logo} src={bglogo} alt="logo-bg" />
        </div>
      </div>
      <div className="row mb-3 justify-content-center">
        <div className={`col-6 ${styles.logocol}`}>
          <h1 className={styles.wel}>Welcome !</h1>
        </div>
      </div>
    </>
  );
}

export default Header;
