import { useAuth } from "../Auth";
import styles from "./WelcomePage.module.css";
import smlogo from "../images/feeds-croped.png"
function WelcomePage({ data }) {
 

  const { saveToken} = useAuth();
  const {saveRefreshToken} = useAuth();

  function onClick() {
    saveToken(data.accesstoken);
    console.log(data)
    
    saveRefreshToken(data.refresh)
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  

  return (
    <>
        <div className="row pt-5 justify-content-center">
          <div className={`col pt-5 mt-5 ${styles.coll}`}>
            <img
              className={styles.img}
              // src="https://s3-alpha-sig.figma.com/img/a05d/6f2e/d578f150c4c6af36ac2074b047e3fbe2?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=TA0XzjwNHyHpfHAAxXHdgKo6sWsVdqrh2uVcxjV2GZ6PRWT~vshScJma0EoSxbmBn1B6ud5uxKbgec41vlBiEJKDB0Q3ymvA7Koa87C9uGmtMLGK8-1WkrHz6FVX281bpP7XscXdK-tmijYZy30p-EDPv8jLzqUiqJJEy7NN7sc7zbsyq-Vq38TPAqF1hVpc5AjIfGhO97dCJPW9rPK~JAp-7BHsUkX0bS5n165AL9xSNoPhP~dQuw6rdYkAhNvVkI8St52o933uXT~WOHalmtsdAPPVqDfkECgB-mG7YLu0rkQeTmMI2jcJVTUKYukmikIYwmohnkAjtZe4UiC~rQ__"
              src={smlogo}
              alt="logo-sm"
            />
          </div>
        </div>
        <p className={styles.wel}>
          Welcome <span>{data.user.employee_name}</span>
        </p>
        <div className="row justify-content-center mt-5">
          <div className={`col ${styles.getcol}`}>
            <button onClick={onClick} className={styles.get} onKeyDown={onClick}>
              Get Started
            </button>
          </div>
        </div>
  
    </>
  );
}

export default WelcomePage;
