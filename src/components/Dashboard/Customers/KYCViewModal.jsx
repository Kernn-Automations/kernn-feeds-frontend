import React from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import styles from "./Customer.module.css";
import KYCModal from "./KYCModal";

function KYCViewModal() {
  return (
    <>
      <DialogRoot placement={"center"} size={"xl"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <KYCModal />
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default KYCViewModal;
