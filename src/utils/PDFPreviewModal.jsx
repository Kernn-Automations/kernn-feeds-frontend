import React, { useEffect, useState } from "react";
import axios from "axios";

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
    <>
      <button className="submitbtn" onClick={() => setOpen(true)}>
        {triggerText}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: "5vh",
            left: "5vw",
            width: "90vw",
            height: "90vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: "transparent",
            }}
          >
            <h5 style={{ margin: 0, color: "white"}}>PDF Preview</h5>
            <div>
              <button className="text-white" onClick={() => setOpen(false)}>
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
            {loading ? (
              <p style={{ padding: "1rem", color: "#000" }}>Loading PDF...</p>
            ) : blobUrl ? (
              <iframe
                src={blobUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            ) : (
              <p style={{ color: "red", padding: "1rem" }}>Unable to load PDF</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PDFPreviewModal;
