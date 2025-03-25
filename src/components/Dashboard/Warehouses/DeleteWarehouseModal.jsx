import styles from "./Warehouse.module.css";
import React, { useEffect, useState } from "react";
import { DialogActionTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";

function DeleteWarehouseModal() {
  const onSubmit = (e) => e.preventDefault();

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
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Delete Warehouse</h3>
      <form action="" onSubmit={onSubmit}>
        <div className="row pt-3 justify-content-center">
          <div className={`col inputcolumn-mdl`}>
            {warehouses && (
              <select name="" id="" className={styles.delsec}>
                <option value="">--Select Warehouse--</option>
                {warehouses.map((warehouse) => (
                  <option value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            )}
            {isModalOpen && (
              <ErrorModal
                isOpen={isModalOpen}
                message={error}
                onClose={closeModal}
              />
            )}

            {loading && <Loading />}
          </div>
        </div>
        <div className="row pt-3 justify-content-center">
          <div className={`col-5`}>
            <button
              type="button"
              className={` cancelbtn`}
              data-bs-dismiss="modal"
            >
              Delete
            </button>

            <DialogActionTrigger asChild>
              <button
                type="button"
                className={`submitbtn`}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </DialogActionTrigger>
          </div>
        </div>
      </form>
    </>
  );
}

export default DeleteWarehouseModal;
