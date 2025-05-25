import styles from "./NavContainer.module.css"
// import smlogo from "../../../images/logo-sm2.png"
import smlogo from "../../../images/feeds-png-logo.png"

function Logo(){

    return <>
    <div className={styles.logo}>
        <img
          src={smlogo}
          alt="logo-sm"
        />
      </div>
    </>
}

export default Logo