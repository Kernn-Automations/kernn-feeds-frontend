import React, { useEffect, useState } from "react";
import styles from "../Sales/Sales.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import invoiceAni from "../../../images/animations/confirmed.gif";
import xls from "../../../images/xls-png.png";
import pdf from "../../../images/pdf-png.png";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import axios from "axios";
import Loading from "@/components/Loading";

function InvoicesPage({ navigate }) {
  const { axiosAPI } = useAuth();

  const defaultFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [warehouse, setWarehouse] = useState();
  const [customer, setCustomer] = useState();
  const [trigger, setTrigger] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);


  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const [customers, setCustomers] = useState([]);

    useEffect(() => {
    async function fetchCustomers() {
        try {
        const res = await axiosAPI.get("/customers");
        setCustomers(res.data.customers || []);
        } catch (err) {
        setError("Failed to fetch customers");
        setIsModalOpen(true);
        }
    }
    fetchCustomers();
    }, []);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        setInvoices([]);
        const res = await axiosAPI.get(
          `/invoice?fromDate=${from}&toDate=${to}${
            warehouse ? `&warehouseId=${warehouse}` : ""
          }${customer ? `&customerId=${customer}` : ""}&page=${pageNo}`
        );
        setInvoices(res.data.invoices || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load invoices");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [trigger, pageNo]);

  const onSubmit = () => setTrigger(!trigger);

  const onExport = (type) => {
    if (!invoices || invoices.length === 0) {
      setError("Table is Empty");
      setIsModalOpen(true);
      return;
    }

    const columns = [
      "S.No",
      "Date",
      "Invoice Number",
      "Invoice Type",
      "Order ID",
      "Warehouse",
      "Customer ID",
      "Customer Name",
      "Amount",
      "Status",
    ];

    const data = invoices.map((inv, i) => ({
      "S.No": i + 1,
      Date: inv.invoiceDate?.slice(0, 10),
      "Invoice Number": inv.invoiceNumber,
      "Invoice Type": inv.type,
      "Order ID": inv.salesOrder?.id,
      Warehouse: inv.salesOrder?.warehouse?.name,
      "Customer ID": inv.customer?.customer_id,
      "Customer Name": inv.customer?.name,
      Amount: inv.salesOrder?.totalAmount,
      Status: inv.salesOrder?.orderStatus,
    }));

    if (type === "PDF") handleExportPDF(columns, data, "Invoices");
    else handleExportExcel(columns, data, "Invoices");
  };
  const handleDownloadDC = async (inv) => {
    try {
      setDownloadingInvoiceId(inv.id)
      const token = localStorage.getItem("access_token");
      const VITE_API = import.meta.env.VITE_API_URL;
      const response = await axios.get(
      `${VITE_API}/sales-orders/dc/${inv.salesOrder?.id}/pdf`,
      {
          responseType: "blob",
          headers: {
          Authorization: `Bearer ${token}`,
          },
      }
      );
      console.log(response);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DeliveryChallan_SO${inv.salesOrder?.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download Delivery Challan PDF", error);
      alert("Failed to download Delivery Challan");
    } finally{
      setDownloadingInvoiceId(null);
    }
  };


  return (
    <>
      <div className="row m-0 p-3">
        <div className="col-3 formcontent">
          <label>From:</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="col-3 formcontent">
          <label>To:</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="col-3 formcontent">
          <label>Customer:</label>
          <select value={customer} onChange={(e) => setCustomer(e.target.value || null)}>
            <option value="">--select--</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row m-0 p-3 justify-content-center">
        <div className="col-3 formcontent">
          <button className="submitbtn" onClick={onSubmit}>
            Submit
          </button>
          <button className="cancelbtn" onClick={() => window.location.reload()}>
            Cancel
          </button>
        </div>
      </div>

      {invoices && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-lg-8">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to</p>
              <img src={xls} alt="xls" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to</p>
              <img src={pdf} alt="pdf" />
            </button>
          </div>
          <div className="col-lg-10">
            <table className="table table-hover table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Invoice Type</th>
                  <th>Customer ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>PDF</th>
                  <th>DC</th> {/* ✅ NEW COLUMN */}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10}>NO DATA FOUND</td>
                  </tr>
                ) : (
                  invoices.map((inv, i) => (
                    <tr key={inv.id}>
                      <td>{i + 1}</td>
                      <td>{inv.invoiceDate?.slice(0, 10)}</td>
                      <td>{inv.invoiceNumber}</td>
                      <td>
                        {inv.type === "bill_of_supply"
                            ? "Bill Of Supply"
                            : inv.type === "tax_invoice"
                            ? "Tax Invoice"
                            : inv.type}
                        </td>
                      <td>{inv.customer?.customer_id}</td>
                      <td>{inv.customer?.name}</td>
                      <td>₹{Number(inv.grandTotal || 0).toFixed(2)}</td>
                      <td>{inv.salesOrder?.orderStatus}</td>
                      <td>
                        <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={async () => {
                            try {
                                setDownloadingInvoiceId(inv.id)
                                const token = localStorage.getItem("access_token");
                                const VITE_API = import.meta.env.VITE_API_URL;

                                const res = await axios.get(
                                `${VITE_API}/invoice/${inv.salesOrder?.id}/pdf?type=${inv.type}`,
                                {
                                    responseType: "blob",
                                    headers: {
                                    Authorization: `Bearer ${token}`,
                                    },
                                }
                                );

                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute("download", `${inv.invoiceNumber}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url); // cleanup
                            } catch {
                                setError("Failed to open PDF");
                                setIsModalOpen(true);
                            } finally{
                                setDownloadingInvoiceId(null);
                            }
                            }}
                        >
                        {downloadingInvoiceId === inv.id ? (
                        <Loading size="sm" thickness="1px" color="#003176" />
                        ) : (
                        "View"
                        )}
                        </button>
                      </td>
                        {/* ✅ DC PDF View Button */}
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownloadDC(inv)}
                          >
                            View
                          </button>
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="row m-0 p-0 pt-3 justify-content-between">
              <div className={`col-2 p-0 ${styles.buttonbox}`}>
                {pageNo > 1 && (
                  <button onClick={() => setPageNo(pageNo - 1)}>
                    <FaArrowLeftLong /> Previous
                  </button>
                )}
              </div>
              <div className={`col-2 p-0 ${styles.buttonbox}`}>
                {pageNo < totalPages && (
                  <button onClick={() => setPageNo(pageNo + 1)}>
                    Next <FaArrowRightLong />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingAnimation gif={invoiceAni} />}
      {isModalOpen && <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />}
    </>
  );
}

export default InvoicesPage;
