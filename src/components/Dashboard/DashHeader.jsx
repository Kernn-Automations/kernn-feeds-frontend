// import { Input } from "@chakra-ui/react"
// import { InputRightElement } from "@chakra-ui/react";
// import { InputGroup } from "@/components/ui/input-group"
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Notification from "./Notification";
import ProfileAvthar from "./ProfileAvthar";
import { IoSearch } from "react-icons/io5";

function DashHeader({ notifications, user, setAdmin, setTab, admin, orgadmin }) {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.header}>
        <div className="row justify-content-between">
          <div className={`col-4 ${styles.headcontent}`}>
            <p className={styles.brand}>Feed Bazaar Pvt Ltd</p>
            {orgadmin &&
              <p className={styles.reset}>
                <span
                  onClick={() => {
                    setAdmin();
                    navigate("/admin");
                  }}
                >
                  <i class="bi bi-arrow-repeat"></i>
                </span>
              </p>
            }
          </div>
          <div className={`col-4 ${styles.headcontent}`}>
            <div className="row pt-2 justify-content-center">
              <div className="col-2">
                <Notification notifications={notifications} />
              </div>
              <div className={`col ${styles.searchbar}`}>
                {/* <input type="text" placeholder="search..." className={styles.search} />
              
              <button type="submit">
                <svg
                  width="24"
                  height="30"
                  viewBox="0 0 24 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="24"
                    height="20"
                    fill="white"
                    fillOpacity="0.6"
                  />
                  <path
                    d="M19.6 17.5L13.3 12.25C12.8 12.5833 12.225 12.8472 11.575 13.0417C10.925 13.2361 10.2333 13.3333 9.5 13.3333C7.68333 13.3333 6.146 12.8089 4.888 11.76C3.63 10.7111 3.00067 9.43 3 7.91667C2.99933 6.40333 3.62867 5.12222 4.888 4.07333C6.14733 3.02444 7.68467 2.5 9.5 2.5C11.3153 2.5 12.853 3.02444 14.113 4.07333C15.373 5.12222 16.002 6.40333 16 7.91667C16 8.52778 15.8833 9.10417 15.65 9.64583C15.4167 10.1875 15.1 10.6667 14.7 11.0833L21 16.3333L19.6 17.5ZM9.5 11.6667C10.75 11.6667 11.8127 11.3022 12.688 10.5733C13.5633 9.84444 14.0007 8.95889 14 7.91667C13.9993 6.87444 13.562 5.98917 12.688 5.26083C11.814 4.5325 10.7513 4.16778 9.5 4.16667C8.24867 4.16556 7.18633 4.53028 6.313 5.26083C5.43967 5.99139 5.002 6.87667 5 7.91667C4.998 8.95667 5.43567 9.84222 6.313 10.5733C7.19033 11.3044 8.25267 11.6689 9.5 11.6667Z"
                    fill="black"
                    fillOpacity="0.9"
                  />
                </svg>
              </button> */}

                {/* <InputGroup>
                  <Input placeholder="Search..." />
                  <InputRightElement>
                    <SearchIcon color="gray.500" />
                  </InputRightElement>
                </InputGroup> */}

                <input type="text" placeholder="Search..." />
                <span className={styles.searchicon}>
                  <IoSearch />
                </span>
              </div>
              <div className="col-2">
                <ProfileAvthar user={user} setTab={setTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashHeader;
