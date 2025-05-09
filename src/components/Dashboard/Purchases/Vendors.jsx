import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import AddVendorViewModal from "./AddVendorViewModal";
import styles from "./Purchases.module.css";
import EditVendorViewModal from "./EditVendorViewModal";

function Vendors({ navigate }) {
  const { axiosAPI } = useAuth();

  const [trigger, setTrigger] = useState(false);

  const changeTrigger = () => setTrigger(!trigger);

  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [suppliers, setSuppliers] = useState();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await axiosAPI.get("/suppliers");
        // console.log(res);
        setSuppliers(res.data.suppliers);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        isModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger]);

  let count = 1;

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/purchases")}>Purchase</span>{" "}
        <i class="bi bi-chevron-right"></i> Vendors
      </p>

      <div className="row m-0 p-3 pt-0">
        <div className="col-3">
          <AddVendorViewModal changeTrigger={changeTrigger} />
        </div>
      </div>

      {suppliers && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-md-9">
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Vendor ID</th>
                  <th>Vendor Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5}>NO DATA FOUND</td>
                  </tr>
                )}
                {suppliers.length > 0 &&
                  suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="animated-row"
                      style={{ animationDelay: `${count * 0.1}s` }}
                    >
                      <td>{count++}</td>
                      <td>{supplier.createdAt.slice(0, 10)}</td>
                      <td>{supplier.supplierCode}</td>
                      <td>{supplier.name}</td>
                      <td>
                        <EditVendorViewModal supplier={supplier} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <Loading />}
    </>
  );
}

export default Vendors;
