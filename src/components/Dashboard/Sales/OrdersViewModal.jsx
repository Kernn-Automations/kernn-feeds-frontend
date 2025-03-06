import React from "react";
import styles from "./Sales.module.css";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import OrdersModal from "./OrdersModal";
function OrdersViewModal() {
  return (
    <>
      <DialogRoot placement={"center"} size={"lg"} className={styles.mdl}>
        <DialogTrigger asChild>
          <button>view</button>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <OrdersModal />
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default OrdersViewModal;
