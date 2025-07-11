import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import styles from "./Payments.module.css";
import { useAuth } from "@/Auth";

function CreditNoteModal({ credit }) {
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
        const res = await axiosAPI.get(`/customers?limit=50`);
        console.log(res);

        setCustomers(res.data.customers);
      } catch (e) {
        // console.log(e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <>
      <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <h3 className={`px-3 mdl-title`}>Credit Note</h3>
            <div className="row m-0 p-0">
              <div className={`col-4 inputcolumn-mdl `}>
                <label htmlFor="">Order Date :</label>
                <input type="date" value={credit.orderDate?.slice(0, 10)} />
              </div>
              <div className={`col-4 inputcolumn-mdl `}>
                <label htmlFor="">Order Number :</label>
                <input type="text" value={credit.orderNumber} />
              </div>
              <div className={`col-4 inputcolumn-mdl `}>
                <label htmlFor="">Discount Type :</label>
                <input type="text" value={credit.discountType} />
              </div>
              {/* <div className={`col-4 inputcolumn-mdl `}>
                <label htmlFor="">Date :</label>
                <input type="date" value={credit.orderDate?.slice(0, 10)} />
              </div> */}
              <div className={`col-4 inputcolumn-mdl `}>
                <label htmlFor="">Amount :</label>
                <input type="text" value={credit.amount} />
              </div>
              <div className="row p-3 m-0 justify-content-center">
                <div className="col-7">
                  <button className="submitbtn">Send Message</button>
                  <button className="cancelbtn">Cancel</button>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default CreditNoteModal;
