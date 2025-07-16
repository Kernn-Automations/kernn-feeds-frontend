import {
    DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import styles from "./InventoryTab.module.css";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";

function DamagedGoodsModal({ item, warehouse }) {
//   console.log(item, warehouse);

  const [damagedQuantity, setDamagedQuantity] = useState();
  const [reason, setReason] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [successful, setSuccessful] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmitReport = async () => {
    if(damagedQuantity <= 0 || damagedQuantity > Number(item.quantity)){
        console.log("called :", damagedQuantity)
        setError("Enter valid Quantity")
        setIsModalOpen(true)
        return
    }
        

    try {
      setLoading(true);
      const res = await axiosAPI.post(
        `/warehouse/${warehouse.id}/inventory/${item.id}/report-damaged`,
        {
          damagedQuantity,
          reason,
        }
      );

      setSuccessful(res.data.message);
      setTimeout(() => setSuccessful(null), 1000)
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message);
      setIsModalOpen(true);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button className={styles.reportsbtn}>Report Damaged Goods</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <h3 className={`px-3 pb-3 mdl-title`}>Report Damaged Goods</h3>
            <div className="row justify-content-center">
              <div className={`col-4 inputcolumn-mdl`}>
                <label>Damaged Quantity:</label>
                <input
                  type="text"
                  value={damagedQuantity}
                  onChange={(e) => setDamagedQuantity(e.target.value)}
                />
              </div>
              <div className={`col-4 inputcolumn-mdl`}>
                <label>Reason :</label>
                <textarea
                  name=""
                  id=""
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="row justify-content-center p-3">
             {!loading && !successful && <div className="col-5">
                <button className="submitbtn" onClick={onSubmitReport}>Report</button>
               <DialogActionTrigger asChild>
                 <button className="cancelbtn">Cancel</button>
               </DialogActionTrigger>
              </div>}
              {!loading && successful &&  <div className="col-5">
                <button className="submitbtn" onClick={onSubmitReport}>Report</button>
               <DialogActionTrigger asChild>
                 <button className="cancelbtn">Cancel</button>
               </DialogActionTrigger>
              </div>}
            </div>

            {loading && <Loading />}
            {isModalOpen && (
              <ErrorModal
                isOpen={isModalOpen}
                message={error}
                onClose={closeModal}
              />
            )}
          </DialogBody>

          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default DamagedGoodsModal;
