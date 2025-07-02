import React, { useEffect, useState } from "react";
import styles from "./Warehouse.module.css";
import ActionViewModal from "./ActionViewModal";
import SelectMode from "./SelectMode";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { useNavigate } from "react-router-dom";
function OngoingWarehouse({ navigate, managers, isAdmin }) {
  const [warehouses, setWarehouses] = useState();

  const { axiosAPI } = useAuth();

  // const navigate = useNavigate();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [trigger, setTrigger] = useState();

  const changeTrigger = () => setTrigger(!trigger);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setWarehouses(null);
        const res = await axiosAPI.get("/warehouse");
        console.log(res);
        setWarehouses(res.data.warehouses);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger]);

  let count = 1;
  return (
    <>     
        <div className="row m-0 p-3 pt-5 justify-content-center">
          <div className="col-lg-10">
          {warehouses && (
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  {/* <th>Enable/Disable</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.length === 0 && (
                  <tr>
                    <td colSpan={5}>No Data Found</td>
                  </tr>
                )}
                {warehouses.length > 0 &&
                  warehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className="animated-row"
                      style={{ animationDelay: `${count * 0.1}s` }}
                    >
                      <td>{count++}</td>
                      <td>{warehouse.id}</td>
                      <td>{warehouse.name}</td>
                      {/* <td className={styles.selectmode}>
                        <SelectMode
                          val={warehouse.managerId ? "enable" : "disable"}
                        />
                      </td> */}
                      <td>
                        <button
                          // className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                        >
                          View
                        </button>
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
