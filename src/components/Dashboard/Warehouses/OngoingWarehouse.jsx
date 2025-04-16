import React, { useEffect, useState } from "react";
import styles from "./Warehouse.module.css";
import ActionViewModal from "./ActionViewModal";
import SelectMode from "./SelectMode";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
function OngoingWarehouse({ navigate }) {
  const [warehouses, setWarehouses] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/warehouse");
        console.log(res);
        setWarehouses(res.data.warehouses);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true)
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

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
          {warehouses && (
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
                {warehouses.length === 0 && <tr>
                    <td colSpan={5}>No Data Found</td>
                  </tr>}
                {warehouses.length > 0 &&
                  warehouses.map((warehouse) => (
                    <tr className="animated-row"
                    style={{ animationDelay: `${count * 0.1}s` }}>
                      <td>{count++}</td>
                      <td>{warehouse.id}</td>
                      <td>{warehouse.name}</td>
                      <td className={styles.selectmode}>
                        <SelectMode
                          val={warehouse.managerId ? "enable" : "disable"}
                        />
                      </td>
                      <td>
                        <ActionViewModal warehouse={warehouse} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
              )}
          </div>
        </div>
    

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default OngoingWarehouse;
