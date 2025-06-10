import React from "react";
import styles from "./Sales.module.css"; 
import { DialogBody, DialogCloseTrigger, DialogContent, DialogRoot, DialogTrigger } from "@/components/ui/dialog";

function SignUploadModal() {
  return (
    <>
      <DialogRoot placement={"center"} size={"xl"} className={styles.mdl}>
        <DialogTrigger asChild>
          <p className={styles.signtext}>Didn't recieved OTP?</p>
        </DialogTrigger>
        <DialogContent className="mdl">
          <DialogBody>
            <p>Helo</p>
          </DialogBody>
          <DialogCloseTrigger className="inputcolumn-mdl-close" />
        </DialogContent>
      </DialogRoot>
    </>
  );
}

export default SignUploadModal;
