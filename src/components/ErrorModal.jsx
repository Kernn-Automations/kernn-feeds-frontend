import React from 'react'
import { Modal, Button } from "react-bootstrap";
import styles from "./Login.module.css"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function ErrorModal({isOpen, message, onClose}) {
  return (
    <>
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className={styles.error}>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

{/* <DialogRoot open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className={styles.error}>
           {message}
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <button variant="outline" onClick={onClose}>Cancel</button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot> */}
    </>
  )
}

export default ErrorModal
