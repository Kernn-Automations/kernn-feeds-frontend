import React, { useState } from "react";
import styles from "./Customer.module.css";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import img from "./../../../images/dummy-img.jpeg";
import { useAuth } from "@/Auth";


function CustomersModal({ customerdata, refetchCustomer }) {
  const [email, setEmail] = useState(customerdata.email || "");
  const [gstin, setGstin] = useState(customerdata.gstin || "");
  const [msme, setMsme] = useState(customerdata.msme || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { axiosAPI } = useAuth();
  return (
    <>
      <h3 className={`px-3 mdl-title`}>Customer</h3>
      <div className="row m-0 p-0 ">
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer ID :</label>
          <input type="text" value={customerdata.customer_id} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Customer Name :</label>
          <input type="text" value={customerdata.name} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse ID :</label>
          <input type="text" value={"N/A"} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse Name :</label>
          <input type="text" value={"N/A"} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE ID :</label>
          <input type="text" value={customerdata.salesExecutiveId} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">SE Name :</label>
          <input type="text" value={customerdata.salesExecutive.name} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Mobile Number :</label>
          <input type="text" value={customerdata.mobile} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">WhatsApp Number :</label>
          <input type="text" value={customerdata.whatsapp} />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Email :</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">GSTIN :</label>
          <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} />
        </div>

        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">MSME Number :</label>
          <input type="text" value={msme} onChange={(e) => setMsme(e.target.value)} />
        </div>

        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Latitude :</label>
          <input type="text" value={customerdata.latitude} readOnly />
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Longitude :</label>
          <input type="text" value={customerdata.longitude} readOnly />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Address</h5>
        <div className={`col-2 ${styles.textform}`}>
          <label htmlFor="">Address :</label>
        </div>
        <div className={`col-5 ${styles.textform}`}>
          <textarea name="" id="" value={customerdata.address}></textarea>
        </div>
      </div>
      <div className="row m-0 p-0 pb-3">
        <h5 className={styles.headmdl}>Proofs</h5>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Aadhar :</label>
          <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
            <DialogTrigger asChild>
              <img
                src={
                  (customerdata.kycDocuments[1] &&
                    customerdata.kycDocuments[0].frontImage) ||
                  img
                }
                alt=""
                className={styles.imagemd}
              />
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h3 className={`px-3 mdl-title`}>Aadhar Card</h3>
                <div className="row m-0 p-0 justify-content-center">
                  <div className={`col-5 `}>
                    <img
                      src={
                        (customerdata.kycDocuments[0] &&
                          customerdata.kycDocuments[0].frontImage) ||
                        img
                      }
                      alt="aadhar"
                      className={styles.imagebg}
                    />
                    <span>Aadhar Front</span>
                  </div>
                  <div className={`col-5 `}>
                    <img
                      src={
                        (customerdata.kycDocuments[0] &&
                          customerdata.kycDocuments[0].backImage) ||
                        img
                      }
                      alt="aadhar"
                      className={styles.imagebg}
                    />
                    <span>Aadhar Back</span>
                  </div>
                </div>
              </DialogBody>
              <DialogCloseTrigger className="inputcolumn-mdl-close" />
            </DialogContent>
          </DialogRoot>
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">PAN :</label>
          <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
            <DialogTrigger asChild>
              <img
                src={
                  (customerdata.kycDocuments[1] &&
                    customerdata.kycDocuments[1].frontImage) ||
                  img
                }
                alt=""
                className={styles.imagemd}
              />
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h3 className={`px-3 mdl-title`}>PAN Card</h3>
                <div className="row m-0 p-0 justify-content-center">
                  <div className={`col-5 `}>
                    <img
                      src={
                        (customerdata.kycDocuments[1] &&
                          customerdata.kycDocuments[1].frontImage) ||
                        img
                      }
                      alt="aadhar"
                      className={styles.imagebg}
                    />
                    <span>PAN Front</span>
                  </div>
                  <div className={`col-5 `}>
                    <img
                      src={
                        (customerdata.kycDocuments[1] &&
                          customerdata.kycDocuments[1].backImage) ||
                        img
                      }
                      alt="aadhar"
                      className={styles.imagebg}
                    />
                    <span>PAN Back</span>
                  </div>
                </div>
              </DialogBody>
              <DialogCloseTrigger className="inputcolumn-mdl-close" />
            </DialogContent>
          </DialogRoot>
        </div>
        <div className={`col-4 ${styles.longformmdl}`}>
          <label htmlFor="">Photo :</label>
          <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
            <DialogTrigger asChild>
              <img
                src={customerdata.photo || img}
                alt=""
                className={styles.imagemd}
              />
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h3 className={`px-3 mdl-title`}>Photo</h3>
                <div className="row m-0 p-0 justify-content-center">
                  <div className={`col-6 pb-3`}>
                    <img
                      src={customerdata.photo || img}
                      alt="aadhar"
                      className={styles.imglg}
                    />
                  </div>
                </div>
              </DialogBody>
              <DialogCloseTrigger className="inputcolumn-mdl-close" />
            </DialogContent>
          </DialogRoot>
        </div>
      </div>
      <div className="row m-0 p-3 pt-4 justify-content-center">
      <div className={`col-4`}>
        <button className="submitbtn" onClick={async () => {
          try {
            setLoading(true);
            const formData = new FormData();
            formData.append("email", email);
            formData.append("gstin", gstin);
            formData.append("msme", msme);
            if (photoFile) {
              formData.append("photo", photoFile);
            }

            const res = await axiosAPI.put(`/customers/${customerdata.id}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            
            if (refetchCustomer) {
              await refetchCustomer();
            }

            setSuccessMessage("Customer updated successfully.");
          } catch (err) {
            setSuccessMessage("Failed to update customer.");
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}>
          {loading ? "Updating..." : "Update"}
        </button>
        {successMessage && <p className="text-success mt-2">{successMessage}</p>}
      </div>
    </div>
      {/* <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-2`}>
          <DialogActionTrigger asChild>
            <button className="cancelbtn">Cancel</button>
          </DialogActionTrigger>
        </div>
      </div> */}
    </>
  );
}

export default CustomersModal;
