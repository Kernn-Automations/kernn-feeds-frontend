import React from "react";
import styles from "./Payments.module.css";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReportsModal from "./ReportsModal";

function ReportsViewModal({report}) {
  console.log("ReportsViewModal received report:", report);
  return (
    <>
      <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <ReportsModal report={report} />
          </DialogBody>

          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default ReportsViewModal;
