import { useNavigate } from "react-router-dom";
import styles from "../Dashboard/Dashboard.module.css";
import StoreProfileAvatar from "./StoreProfileAvatar";
import SearchBar from "../Dashboard/SearchBar";

function StoreDashHeader({
  notifications,
  user,
  setTab,
  admin,
  orgadmin,
}) {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.header}>
        <div className="row justify-content-between">
          <div className={`col-4 ${styles.headcontentTitle}`}>
            <p className={styles.brand}>Feed Bazaar Pvt Ltd</p>
          </div>
          <div className={`col-8 ${styles.headcontent}`}>
            <div className={styles.headerRight}>
              <div className={styles.searchContainer}>
                <SearchBar />
              </div>
              
              <div className={styles.profileContainer}>
                <StoreProfileAvatar user={user} setTab={setTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StoreDashHeader;
