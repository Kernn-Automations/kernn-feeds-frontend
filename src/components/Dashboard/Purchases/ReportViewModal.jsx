import React from "react";
import styles from "./Purchases.module.css"
import { DialogBody, DialogCloseTrigger, DialogContent, DialogRoot, DialogTrigger } from "@/components/ui/dialog";
import ReportsModal from "./ReportsModal";


function ReportViewModal({order, warehouses}) {
  return (
    <>
      <DialogRoot placement={"center"} size={"xl"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button className={styles}>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
          <ReportsModal order={order} warehouses={warehouses}/>
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default ReportViewModal;
