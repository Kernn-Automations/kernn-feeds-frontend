import React from "react";
import styles from "./Warehouse.module.css";
import ActionViewModal from "./ActionViewModal";
import SelectMode from "./SelectMode";
function OngoingWarehouse({ navigate }) {
  let count = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/warehouses")}>Warehouse</span>{" "}
        <i class="bi bi-chevron-right"></i> Ongoing
      </p>

      {/* <div className="row m-0 p-3 pt-5 justify-content-center">
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
      </div> */}

      <div className="row m-0 p-3 pt-5 justify-content-center">
        <div className="col-lg-10">
          <table className="table table-bordered borderedtable">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Warehouse ID</th>
                <th>Warehouse Name</th>
                <th>Enable/Disable</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>#3454</td>
                <td>Warehouse 1</td>
                <td className={styles.selectmode}><SelectMode val={"enable"}/></td>
                <td><ActionViewModal/></td>
              </tr>
              <tr>
                <td>2</td>
                <td>#3455</td>
                <td>Warehouse 2</td>
                <td className={styles.selectmode}><SelectMode val={"enable"}/></td>
                <td><ActionViewModal/></td>
              </tr>
              <tr>
                <td>3</td>
                <td>#3456</td>
                <td>Warehouse 3</td>
                <td className={styles.selectmode}><SelectMode val={"disable"}/></td>
                <td><ActionViewModal/></td>
              </tr>
              <tr>
                <td>4</td>
                <td>#3457</td>
                <td>Warehouse 4</td>
                <td className={styles.selectmode}><SelectMode val={"disable"}/></td>
                <td><ActionViewModal/></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default OngoingWarehouse;
