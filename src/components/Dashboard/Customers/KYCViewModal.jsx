import React, { useEffect, useState } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import styles from "./Customer.module.css";
import KYCModal from "./KYCModal";
import { useAuth } from "@/Auth";

function KYCViewModal({ customer, changeTrigger }) {
  const [customerdata, setCustomerdata] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { axiosAPI } = useAuth();
  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get(`/customers/${customer.id}`);
        console.log(res);
        setCustomerdata(res.data.customer);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);
  return (
    <>
      {!customerdata && <span className="text-denger"></span>}
      {customerdata && (
        <DialogRoot placement={"center"} size={"xl"} className={styles.mdl}>
          <DialogTrigger asChild>
            <button>view</button>
          </DialogTrigger>
          <DialogContent className="mdl">
            <DialogBody>
              <KYCModal customerdata={customerdata} changeTrigger={changeTrigger}/>
            </DialogBody>
            <DialogCloseTrigger className="inputcolumn-mdl-close" />
          </DialogContent>
        </DialogRoot>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <span>loading..</span>}
    </>
  );
}

export default KYCViewModal;
