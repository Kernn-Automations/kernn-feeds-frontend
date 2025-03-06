import styles from "./Dashboard.module.css";

function FootLink() {
  return (
    <>
      <footer className={styles.foot}>
        <div className={`row p-0 m-0 justify-content-center text-center `}>
          <p className={""}>
            Powered by{" "}
            <span>
              <a
                href="https://kernn.ai/"
                target="blank"
                className="nav-link d-inline"
              >
                KERNN
              </a>
            </span>
          </p>
        </div>
      </footer>
    </>
  );
}

export default FootLink;
