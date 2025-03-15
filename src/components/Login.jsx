import { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Input from "./Input";
import WelcomePage from "./WelComePage";
import styles from "./Login.module.css";

function Login() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({});
  return (
    <>
      <div className={`container-fluid ${styles.cont}`}>
        {!login && (
          <>
            <div className={styles.logincontainer}>
              <Header />
              <Input setLogin={setLogin} setUser={setUser} />
              <Footer />
            </div>
          </>
        )}

        {login && <WelcomePage data={user} />}
      </div>
    </>
  );
}

export default Login;
