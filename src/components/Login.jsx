import { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Input from "./Input";
import WelcomePage from "./WelComePage";
import styles from "./Login.module.css";


function Login() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState({})
  return (
    <>
      <div className={`container-fluid ${styles.cont}`}>
          {!login && (
            <>
              <Header />
              <Input setLogin={setLogin} setUser={setUser}/>
              <Footer />
            </>
          )}

          {login && <WelcomePage data={user} />}
        </div>
    </>
  );
}

export default Login;
