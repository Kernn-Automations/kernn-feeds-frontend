import React from "react";
import styles from "./Warehouse.module.css";
import ActionViewModal from "./ActionViewModal";
function OngoingWarehouse({ navigate }) {
  let count = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate(-1)}>Warehouse</span>{" "}
        <i class="bi bi-chevron-right"></i> Ongoing
      </p>

      <div className="row m-0 p-3 pt-5 justify-content-center">
        <div className="col-7">
          <div
            className="accordion accordion-flush"
            id={`nestedAccordion${count}`}
          >
            <div className="accordion-item pb-3">
              <h2 className="accordion-header" id={`nestedHeading${count}`}>
                <button
                  className={`accordion-button collapsed ${styles.intacc}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#nestedCollapse${count}`}
                  aria-expanded="false"
                  aria-controls="nestedCollapseOne"
                >
                  District Name - Head Name -ID
                </button>
              </h2>
              <div
                id={`nestedCollapse${count}`}
                className="accordion-collapse collapse"
                aria-labelledby="nestedHeadingOne"
                data-bs-parent={`#nestedAccordion${count++}`}
              >
                <div className={`accordion-body ${styles.intbody}`}>
                  <div className={styles.box}>
                    Warehouse Type - Warehouse ID - Name -
                    <ActionViewModal />
                  </div>
                  <div className={styles.box}>
                    Warehouse Type - Warehouse ID - Name -
                    <ActionViewModal />
                  </div>
                </div>
              </div>
            </div>

            <div className="accordion-item pb-3">
              <h2 className="accordion-header" id={`nestedHeading${count}`}>
                <button
                  className={`accordion-button collapsed ${styles.intacc}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#nestedCollapse${count}`}
                  aria-expanded="false"
                  aria-controls="nestedCollapseOne"
                >
                  District Name - Head Name -ID
                </button>
              </h2>
              <div
                id={`nestedCollapse${count}`}
                className="accordion-collapse collapse"
                aria-labelledby="nestedHeadingOne"
                data-bs-parent={`#nestedAccordion${count++}`}
              >
                <div className={`accordion-body ${styles.intbody}`}>
                  <div className={styles.box}>
                    Warehouse Type - Warehouse ID - Name -
                    <ActionViewModal />
                  </div>
                  <div className={styles.box}>
                    Warehouse Type - Warehouse ID - Name -
                    <ActionViewModal />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OngoingWarehouse;
