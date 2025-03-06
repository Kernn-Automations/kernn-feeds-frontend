import React from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import styles from "./Customer.module.css";
import CustomersModal from "./CustomersModal";

function CustomersViewModal() {
  return (
    <>
      <DialogRoot placement={"center"} size={"xl"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <CustomersModal />
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default CustomersViewModal;
