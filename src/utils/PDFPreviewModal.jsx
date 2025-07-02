// components/PDFPreviewModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DialogRoot,
  DialogTrigger,
  DialogBody,
  DialogContent,
  DialogCloseTrigger,
} from "@/components/ui/dialog";

const PDFPreviewModal = ({
  triggerText = "Preview PDF",
  pdfUrl,
  filename = "document.pdf",
}) => {
  const [open, setOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const VITE_API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("access_token");
    let objectURL = null;

    const fetchPDF = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${VITE_API}${pdfUrl}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });

        if (!(response.data instanceof Blob)) {
          throw new Error("Expected Blob but got something else");
        }

        objectURL = URL.createObjectURL(response.data);
        setBlobUrl(objectURL);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setBlobUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [open, pdfUrl]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    };
  };

  return (
    <DialogRoot open={open} onOpenChange={setOpen} placement="center" size="xl">
      <DialogTrigger asChild>
        <button className="submitbtn">{triggerText}</button>
      </DialogTrigger>
      <DialogContent style={{ maxWidth: "1000px", padding: "1rem", backgroundColor: "rgba(0,0,0,0.3)" }}>
        <DialogBody>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h5>PDF Preview</h5>
            <div>
              <button className="submitbtn me-2" onClick={handleDownload}>
                Save
              </button>
              <button className="submitbtn me-2" onClick={handlePrint}>
                Print
              </button>
              <DialogCloseTrigger asChild>
                <button className="cancelbtn" onClick={() => setOpen(false)}>Close</button>
              </DialogCloseTrigger>
            </div>
          </div>
          {loading ? (
            <p>Loading PDF...</p>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title="PDF Preview"
              width="100%"
              height="600px"
              style={{ border: "1px solid #ccc" }}
            />
          ) : (
            <p style={{ color: "red" }}>Unable to load PDF</p>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default PDFPreviewModal;
