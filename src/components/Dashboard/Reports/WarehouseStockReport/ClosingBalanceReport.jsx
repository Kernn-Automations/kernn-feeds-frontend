import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import React, { useEffect, useState } from "react";
import styles from "./../Reports.module.css";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "@/images/xls-png.png";
import pdf from "@/images/pdf-png.png";

function ClosingBalanceReport({ navigate }) {
  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  const { axiosAPI } = useAuth();

  const [to, setTo] = useState(today);
  const [filter, setFilter] = useState("division");

  const [groups, setGroups] = useState([]); // divisions/zones/etc.
  const [products, setProducts] = useState([]); // unique products

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setGroups([]);
        setProducts([]);

        const query = `/warehouse/closing-balance?productId=0&toDate=${to}&groupBy=${filter}`;
        console.log("Query:", query);

        const res = await axiosAPI.get(query);
        const data = res.data?.data || [];

        console.log(res)

        // Collect groups
        const groupList = data.map((g) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          products: g.products,
        }));

        // Collect unique products across groups
        const allProducts = [];
        data.forEach((grp) => {
          grp.products.forEach((p) => {
            if (!allProducts.find((ap) => ap.productId === p.productId)) {
              allProducts.push({
                productId: p.productId,
                productName: p.productName,
              });
            }
          });
        });

        setGroups(groupList);
        setProducts(allProducts);
      } catch (e) {
        console.log(e);
        setError(e.response?.data?.message || "Something went wrong");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [to, filter]);

  const onExport = (type) => {
    if (!products || products.length === 0) {
      setError("Table is Empty");
      setIsModalOpen(true);
      return;
    }

    const columns = ["S.No", "Product Name", ...groups.map((g) => g.groupName), "Total"];
    let x = 1;

    const arr = products.map((p) => {
      const row = {
        "S.No": x++,
        "Product Name": p.productName,
      };

      let rowTotal = 0;
      groups.forEach((grp) => {
        const found = grp.products.find((gp) => gp.productId === p.productId);
        const val = found ? found.quantityOnDate : 0;
        row[grp.groupName] = val;
        rowTotal += val;
      });

      row["Total"] = rowTotal;
      return row;
    });

    // Add footer totals
    const footer = {
      "S.No": "",
      "Product Name": "Total",
    };

    let grandTotal = 0;
    groups.forEach((grp) => {
      const colTotal = products.reduce((sum, p) => {
        const found = grp.products.find((gp) => gp.productId === p.productId);
        return sum + (found ? found.quantityOnDate : 0);
      }, 0);
      footer[grp.groupName] = colTotal;
      grandTotal += colTotal;
    });
    footer["Total"] = grandTotal;
    arr.push(footer);

    if (type === "PDF") handleExportPDF(columns, arr, "Closing-Balance-Report");
    else if (type === "XLS") handleExportExcel(columns, arr, "Closing-Balance-Report");
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/reports")}>Reports</span>{" "}
        <i className="bi bi-chevron-right"></i>{" "}
        <span onClick={() => navigate("/reports/stock-reports")}>
          Stock-Reports
        </span>{" "}
        <i className="bi bi-chevron-right"></i> Closing-Balance-Report
      </p>

      <div className="row m-0 p-3">
        <div className={`col-6 formcontent`}>
          <label>Date :</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className={`col-6 formcontent`}>
          <label>Group By :</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="company">Company</option>
            <option value="division">Divisions</option>
            <option value="zone">Zones</option>
            <option value="subzone">Sub Zones</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
      </div>

      {products.length > 0 && (
        <>
          <div className="row m-0 p-3 pb-0 justify-content-around">
            <div className="col-lg-7">
              <button className={styles.xls} onClick={() => onExport("XLS")}>
                <p>Export to </p>
                <img src={xls} alt="" />
              </button>
              <button className={styles.xls} onClick={() => onExport("PDF")}>
                <p>Export to </p>
                <img src={pdf} alt="" />
              </button>
            </div>
          </div>

          <div className="row m-0 p-3 justify-content-around">
            <div className="col-lg-12">
              <table className={`table table-bordered borderedtable`}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product Name</th>
                    {groups.map((g) => (
                      <th key={g.groupId}>{g.groupName}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    let rowTotal = 0;
                    return (
                      <tr key={p.productId}>
                        <td>{i + 1}</td>
                        <td>{p.productName}</td>
                        {groups.map((grp) => {
                          const found = grp.products.find(
                            (gp) => gp.productId === p.productId
                          );
                          const val = found ? found.quantityOnDate : 0;
                          rowTotal += val;
                          return <td key={grp.groupId}>{val}</td>;
                        })}
                        <td style={{ fontWeight: "bold" }}>{rowTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}>
                    <td></td>
                    <td>Total</td>
                    {groups.map((grp) => {
                      const colTotal = products.reduce((sum, p) => {
                        const found = grp.products.find(
                          (gp) => gp.productId === p.productId
                        );
                        return sum + (found ? found.quantityOnDate : 0);
                      }, 0);
                      return <td key={grp.groupId}>{colTotal}</td>;
                    })}
                    <td>
                      {groups.reduce((gt, grp) => {
                        const colTotal = products.reduce((sum, p) => {
                          const found = grp.products.find(
                            (gp) => gp.productId === p.productId
                          );
                          return sum + (found ? found.quantityOnDate : 0);
                        }, 0);
                        return gt + colTotal;
                      }, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <Loading />}
    </>
  );
}

export default ClosingBalanceReport;
