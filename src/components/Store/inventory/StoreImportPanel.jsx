import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";
import storeService from "@/services/storeService";

const cardStyle = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

export default function StoreImportPanel({
  storeCode = "",
  allowMultiStore = false,
  onImportSuccess,
  title,
  description,
}) {
  const [importType, setImportType] = useState("ledger_rows");
  const [importing, setImporting] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [pendingImportRows, setPendingImportRows] = useState([]);
  const [pendingImportFileName, setPendingImportFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const importPreviewCount = pendingImportRows.length;

  const helperText = useMemo(() => {
    if (importType === "store_invoices") {
      return allowMultiStore
        ? "Upload invoice rows for many stores in one file. Each row must include a valid storeCode."
        : "Upload invoice rows for this store using productSku and storeCode from the template.";
    }

    return allowMultiStore
      ? "Upload ledger rows for many stores in one file. The backend will resolve each row using storeCode."
      : "Upload ledger rows for this store using productSku and the current store code.";
  }, [allowMultiStore, importType]);

  const downloadExcelTemplate = () => {
    const isInvoiceTemplate = importType === "store_invoices";
    const firstStoreCode = storeCode || (allowMultiStore ? "STORE039" : "");
    const secondStoreCode = allowMultiStore ? "STORE040" : firstStoreCode;

    const rowsSheet = XLSX.utils.json_to_sheet(
      isInvoiceTemplate
        ? [
            {
              invoiceNumber: "STORE-INV-IMPORT-001",
              storeCode: firstStoreCode,
              recordedAt: "2026-03-05T10:30",
              customerName: "Ramesh Patel",
              customerMobile: "9876543210",
              farmerName: "Ramesh Patel",
              village: "Anand",
              paymentMethod: "cash",
              paymentAmount: 35400,
              transactionNumber: "",
              notes: "Imported backdated store invoice",
              productSku: "27%",
              quantity: 20,
              unitPrice: 1500,
              discountAmount: 0,
              taxAmount: 2400,
              finalAmount: 32400,
            },
            {
              invoiceNumber: "STORE-INV-IMPORT-002",
              storeCode: secondStoreCode,
              recordedAt: "2026-03-05T11:15",
              customerName: "Suresh Rao",
              customerMobile: "9988776655",
              farmerName: "Suresh Rao",
              village: "Koduru",
              paymentMethod: "bank",
              paymentAmount: 3360,
              transactionNumber: "UTR123456",
              notes: "Imported second store invoice",
              productSku: "Gouri",
              quantity: 2,
              unitPrice: 1500,
              discountAmount: 0,
              taxAmount: 360,
              finalAmount: 3360,
            },
          ]
        : [
            {
              storeCode: firstStoreCode,
              productSku: "27%",
              transactionType: "adjustment",
              quantity: 120,
              recordedAt: "2026-03-01T09:00",
              referenceId: "OPENING-2026-03-01",
              remarks: "Opening stock reset",
              unitPrice: 0,
              totalPrice: 0,
            },
            {
              storeCode: secondStoreCode,
              productSku: "Gouri",
              transactionType: "stockin",
              quantity: 25,
              recordedAt: "2026-03-02T11:30",
              referenceId: "IMPORT-ROW-2",
              remarks: "Backdated warehouse receipt",
              unitPrice: 1450,
              totalPrice: 36250,
            },
          ],
    );

    const instructionsSheet = XLSX.utils.aoa_to_sheet(
      isInvoiceTemplate
        ? [
            ["Required Format - Store Invoices"],
            ["Column", "Required", "Notes"],
            ["invoiceNumber", "Yes", "Repeat invoiceNumber for each item row in the same invoice"],
            ["storeCode", "Yes", allowMultiStore ? "Can vary row by row across many stores" : "Use the selected store code"],
            ["recordedAt", "Yes", "Use YYYY-MM-DDTHH:mm"],
            ["customerName", "Optional", "Customer display name"],
            ["customerMobile", "Optional", "Used to match/create customer"],
            ["farmerName", "Optional", "Farmer name"],
            ["village", "Optional", "Village name"],
            ["paymentMethod", "Optional", "cash or bank"],
            ["paymentAmount", "Optional", "If blank, backend uses invoice grand total"],
            ["transactionNumber", "Optional", "UTR/reference for bank payment"],
            ["notes", "Optional", "Sale note"],
            ["productSku", "Yes", "Product SKU code, not internal id"],
            ["quantity", "Yes", "Positive bag quantity only"],
            ["unitPrice", "Yes", "Per-bag rate"],
            ["discountAmount", "Optional", "Numeric per row"],
            ["taxAmount", "Optional", "Numeric per row"],
            ["finalAmount", "Optional", "If blank, backend derives it"],
          ]
        : [
            ["Required Format - Ledger Rows"],
            ["Column", "Required", "Notes"],
            ["storeCode", "Yes", allowMultiStore ? "Can vary row by row across many stores" : "Use the selected store code"],
            ["productSku", "Yes", "Product SKU code, not internal id"],
            ["transactionType", "Yes", "Use stockin, stockout, or adjustment"],
            ["quantity", "Yes", "Positive bag quantity only"],
            ["recordedAt", "Yes", "Use YYYY-MM-DDTHH:mm"],
            ["referenceId", "Optional", "Unique row reference for idempotent imports"],
            ["remarks", "Optional", "Note for audit/history"],
            ["unitPrice", "Optional", "Numeric price per bag"],
            ["totalPrice", "Optional", "Numeric total value"],
          ],
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      rowsSheet,
      isInvoiceTemplate ? "StoreInvoices" : "LedgerRows",
    );
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    XLSX.writeFile(
      workbook,
      allowMultiStore
        ? isInvoiceTemplate
          ? "admin_multi_store_invoice_import_template.xlsx"
          : "admin_multi_store_ledger_import_template.xlsx"
        : isInvoiceTemplate
          ? "store_invoice_import_template.xlsx"
          : "store_ledger_import_template.xlsx",
    );
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: false,
      });

      if (!rawRows.length) {
        throw new Error("The uploaded file does not contain any data rows.");
      }

      const normalizedRows = rawRows.map((row, index) => {
        if (importType === "store_invoices") {
          const invoiceNumber = String(row.invoiceNumber || "").trim();
          const productSku = String(
            row.productSku || row.productSKU || row.sku || row.SKU || "",
          ).trim();
          const quantity = Number(row.quantity);
          const rowRecordedAt = String(row.recordedAt || "").trim();
          const rowStoreCode = String(row.storeCode || storeCode || "").trim();

          if (!invoiceNumber) {
            throw new Error(`Row ${index + 2}: invoiceNumber is required.`);
          }
          if (!productSku) {
            throw new Error(`Row ${index + 2}: productSku is required.`);
          }
          if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(
              `Row ${index + 2}: quantity must be a positive bag value.`,
            );
          }
          if (!rowRecordedAt) {
            throw new Error(`Row ${index + 2}: recordedAt is required.`);
          }
          if (!rowStoreCode) {
            throw new Error(`Row ${index + 2}: storeCode is required.`);
          }

          return {
            invoiceNumber,
            storeCode: rowStoreCode,
            recordedAt: rowRecordedAt,
            customerName: String(row.customerName || "").trim(),
            customerMobile: String(row.customerMobile || "").trim(),
            farmerName: String(row.farmerName || "").trim(),
            village: String(row.village || "").trim(),
            paymentMethod: String(row.paymentMethod || "cash")
              .trim()
              .toLowerCase(),
            paymentAmount: Number(row.paymentAmount || 0),
            transactionNumber: String(row.transactionNumber || "").trim(),
            notes: String(row.notes || "").trim(),
            productSku,
            quantity,
            unitPrice: Number(row.unitPrice || 0),
            discountAmount: Number(row.discountAmount || 0),
            taxAmount: Number(row.taxAmount || 0),
            finalAmount: Number(row.finalAmount || 0),
          };
        }

        const transactionType = String(row.transactionType || "")
          .trim()
          .toLowerCase();
        const quantity = Number(row.quantity);
        const productSku = String(
          row.productSku || row.productSKU || row.sku || row.SKU || "",
        ).trim();
        const rowRecordedAt = String(row.recordedAt || "").trim();
        const rowStoreCode = String(row.storeCode || storeCode || "").trim();

        if (!productSku) {
          throw new Error(`Row ${index + 2}: productSku is required.`);
        }
        if (!["stockin", "stockout", "adjustment"].includes(transactionType)) {
          throw new Error(`Row ${index + 2}: invalid transactionType.`);
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(
            `Row ${index + 2}: quantity must be a positive bag value.`,
          );
        }
        if (!rowRecordedAt) {
          throw new Error(`Row ${index + 2}: recordedAt is required.`);
        }
        if (!rowStoreCode) {
          throw new Error(`Row ${index + 2}: storeCode is required.`);
        }

        return {
          storeCode: rowStoreCode,
          productSku,
          transactionType,
          quantity,
          recordedAt: rowRecordedAt,
          referenceId: String(row.referenceId || `excel-${Date.now()}-${index}`),
          remarks: String(row.remarks || "").trim() || null,
          unitPrice: Number(row.unitPrice || 0),
          totalPrice: Number(row.totalPrice || 0),
        };
      });

      setPendingImportRows(normalizedRows);
      setPendingImportFileName(file.name || "import.xlsx");
      setShowImportPreview(true);
    } catch (err) {
      setError(err.message || "Failed to parse import file.");
      setShowErrorModal(true);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImportRows.length) return;

    try {
      setImporting(true);
      const response = await storeService.importStoreLedgerRows({
        rows: pendingImportRows,
        referenceType: "ExcelLedgerImport",
        importType,
      });

      if (!response.success) {
        throw new Error(response.message || "Import failed.");
      }

      setSuccess(
        importType === "store_invoices"
          ? `Imported ${pendingImportRows.length} invoice row(s) successfully.`
          : `Imported ${pendingImportRows.length} ledger row(s) successfully.`,
      );
      setShowSuccessModal(true);
      setShowImportPreview(false);
      setPendingImportRows([]);
      setPendingImportFileName("");
      if (onImportSuccess) {
        await onImportSuccess();
      }
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorDetails = errorData.errorDetails || {};
      const detailedErrorMessage =
        errorDetails && (errorDetails.productId || errorDetails.productSku)
          ? [
              errorData.message || err.message || "Import failed.",
              errorDetails.productSku
                ? `Product SKU: ${errorDetails.productSku}`
                : "",
              errorDetails.productId ? `Product: ${errorDetails.productId}` : "",
              errorDetails.referenceId
                ? `Reference: ${errorDetails.referenceId}`
                : "",
              errorDetails.recordedAt
                ? `Recorded At: ${errorDetails.recordedAt}`
                : "",
              Number.isFinite(errorDetails.runningBalance)
                ? `Running Balance After Entry: ${errorDetails.runningBalance}`
                : "",
            ]
              .filter(Boolean)
              .join("\n")
          : err.message || "Import failed.";

      setError(detailedErrorMessage);
      setShowErrorModal(true);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.16)",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              {allowMultiStore ? "Multi-Store Admin Import" : "Store Import"}
            </div>
            <h5 style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
              {title ||
                (allowMultiStore
                  ? "Import Data For Many Stores"
                  : "Backdated Excel / CSV Import")}
            </h5>
            <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
              {description || helperText}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  fontSize: 12,
                  color: "#334155",
                }}
              >
                Supports: `.xlsx`, `.xls`, `.csv`
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  fontSize: 12,
                  color: "#334155",
                }}
              >
                Match by `storeCode` + `productSku`
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  fontSize: 12,
                  color: "#334155",
                }}
              >
                Preview before import
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10, minWidth: 260 }}>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              style={{
                minWidth: "220px",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#fff",
              }}
            >
              <option value="ledger_rows">Ledger Rows Template</option>
              <option value="store_invoices">Store Invoices Template</option>
            </select>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              style={{
                padding: "11px 14px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              Download Template
            </button>
            <label
              style={{
                display: "grid",
                gap: 8,
                cursor: importing ? "not-allowed" : "pointer",
                opacity: importing ? 0.7 : 1,
                padding: "16px",
                borderRadius: 16,
                border: "1px dashed #60a5fa",
                background:
                  "linear-gradient(180deg, rgba(239,246,255,0.96) 0%, rgba(255,255,255,0.98) 100%)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                {importing ? "Preparing Preview..." : "Upload Excel / CSV"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Parse first, review exact rows, then confirm import.
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,text/csv"
                onChange={handleImportFile}
                disabled={importing}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 16,
            background: "rgba(255,255,255,0.88)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
            Active template format
          </div>
          <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.6 }}>
            {importType === "store_invoices"
              ? "invoiceNumber, storeCode, recordedAt, customerName, customerMobile, farmerName, village, paymentMethod, paymentAmount, transactionNumber, notes, productSku, quantity, unitPrice, discountAmount, taxAmount, finalAmount"
              : "storeCode, productSku, transactionType(stockin/stockout/adjustment), quantity, recordedAt, referenceId, remarks, unitPrice, totalPrice"}
          </div>
          {importPreviewCount > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#1d4ed8" }}>
              Parsed preview ready: {importPreviewCount} row(s) from{" "}
              {pendingImportFileName}
            </div>
          )}
        </div>
      </div>

      {showImportPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "min(1180px, 100%)",
              maxHeight: "88vh",
              borderRadius: 20,
              padding: 20,
              overflow: "hidden",
              boxShadow: "0 28px 70px rgba(0,0,0,0.24)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <div>
                <h5 style={{ margin: 0, fontWeight: 800 }}>Import Preview</h5>
                <div
                  style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}
                >
                  File: {pendingImportFileName} | Type: {importType} | Rows:{" "}
                  {pendingImportRows.length}
                </div>
                <div
                  style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}
                >
                  These exact rows will be sent to the backend after you click
                  Import.
                </div>
              </div>
            </div>

            <div
              style={{
                overflow: "auto",
                maxHeight: "60vh",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
              }}
            >
              <table className="table" style={{ marginBottom: 0, fontSize: 12 }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8fafc",
                    zIndex: 1,
                  }}
                >
                  <tr>
                    {Object.keys(pendingImportRows[0] || {}).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingImportRows.map((row, index) => (
                    <tr
                      key={`${index}-${row.referenceId || row.invoiceNumber || "row"}`}
                    >
                      {Object.keys(pendingImportRows[0] || {}).map((key) => (
                        <td key={key}>{String(row[key] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowImportPreview(false);
                  setPendingImportRows([]);
                  setPendingImportFileName("");
                }}
                disabled={importing}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: "#16a34a",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <ErrorModal
          isOpen={showErrorModal}
          message={error}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          message={success}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  );
}
