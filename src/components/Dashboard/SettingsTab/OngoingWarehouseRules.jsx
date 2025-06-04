import React, { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import OngoingWarehouseRuleModal from "./OngoingWarehouseRuleModal";

function OngoingWarehouseRules({ navigate }) {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const { axiosAPI } = useAuth();

  const fetchRules = async () => {
    try {
      setLoading(true);
      setRules([]);
      const res = await axiosAPI.get("/warehouse/rules");
      setRules(res.data.rules || []);
    } catch (e) {
      setError(e.response?.data?.message || "Error fetching rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleModalClose = (updated) => {
    setSelectedRule(null);
    if (updated) fetchRules(); // Re-fetch if updated
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/settings")}>Settings</span>{" "}
        <i className="bi bi-chevron-right"></i>
        <span onClick={() => navigate("/settings/warehouse-rules")}>
          Warehouse Rules
        </span>{" "}
        <i className="bi bi-chevron-right"></i>
        Ongoing Rules
      </p>

      <div className="row m-0 p-3 pt-5 justify-content-center">
        <div className="col-lg-10">
          {loading && <Loading />}
          {!loading && (
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Rule Id</th>
                  <th>Minimum Quantity</th>
                  <th>Maximum Quantity</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No Data Found</td>
                  </tr>
                ) : (
                  rules.map((rule, index) => (
                    <tr
                      key={rule.id}
                      className="animated-row"
                      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                    >
                      <td>{index + 1}</td>
                      <td>{rule.id}</td>
                      <td>{rule.minQuantity}</td>
                      <td>{rule.maxQuantity}</td>
                      <td>{rule.unit}</td>
                      <td>
                        <button onClick={() => setSelectedRule(rule)}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedRule && (
        <OngoingWarehouseRuleModal
          rule={selectedRule}
          onClose={handleModalClose}
        />
      )}

      {error && (
        <ErrorModal isOpen={true} message={error} onClose={() => setError(null)} />
      )}
    </>
  );
}

export default OngoingWarehouseRules;
