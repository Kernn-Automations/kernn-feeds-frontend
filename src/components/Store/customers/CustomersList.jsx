import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Dashboard/Purchases/Purchases.module.css";
import { FaUserCheck, FaUserClock } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

export default function CustomersList() {
  const navigate = useNavigate();
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [customers, setCustomers] = useState([
    { id: "CUST001", name: "Rajesh Kumar", mobile: "9876543210", area: "Downtown", isActive: true, orders: 12, lastOrder: "15-01-2024" },
    { id: "CUST002", name: "Priya Sharma", mobile: "9876543211", area: "Uptown", isActive: true, orders: 8, lastOrder: "12-01-2024" },
    { id: "CUST003", name: "Amit Singh", mobile: "9876543212", area: "Midtown", isActive: false, orders: 3, lastOrder: "08-01-2024" },
    { id: "CUST004", name: "Sneha Patel", mobile: "9876543213", area: "Downtown", isActive: true, orders: 15, lastOrder: "14-01-2024" },
    { id: "CUST005", name: "Vikram Mehta", mobile: "9876543214", area: "Uptown", isActive: false, orders: 2, lastOrder: "01-01-2024" },
    { id: "CUST006", name: "Anjali Desai", mobile: "9876543215", area: "Midtown", isActive: true, orders: 20, lastOrder: "16-01-2024" },
    { id: "CUST007", name: "Rahul Verma", mobile: "9876543216", area: "Downtown", isActive: true, orders: 7, lastOrder: "13-01-2024" },
    { id: "CUST008", name: "Kavita Nair", mobile: "9876543217", area: "Uptown", isActive: false, orders: 4, lastOrder: "10-01-2024" },
    { id: "CUST009", name: "Suresh Reddy", mobile: "9876543218", area: "Midtown", isActive: true, orders: 11, lastOrder: "11-01-2024" },
    { id: "CUST010", name: "Meera Joshi", mobile: "9876543219", area: "Downtown", isActive: true, orders: 9, lastOrder: "09-01-2024" },
    { id: "CUST011", name: "Arjun Malhotra", mobile: "9876543220", area: "Uptown", isActive: true, orders: 6, lastOrder: "07-01-2024" },
    { id: "CUST012", name: "Divya Iyer", mobile: "9876543221", area: "Midtown", isActive: false, orders: 5, lastOrder: "05-01-2024" },
    { id: "CUST013", name: "Nikhil Kapoor", mobile: "9876543222", area: "Downtown", isActive: true, orders: 14, lastOrder: "06-01-2024" },
    { id: "CUST014", name: "Pooja Shah", mobile: "9876543223", area: "Uptown", isActive: true, orders: 18, lastOrder: "04-01-2024" },
    { id: "CUST015", name: "Rohit Agarwal", mobile: "9876543224", area: "Midtown", isActive: true, orders: 10, lastOrder: "03-01-2024" }
  ]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(customers.length / limit));
    setPageNo(1); // Reset page number when limit changes
  }, [limit, customers.length]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (pageNo - 1) * limit;
    const endIndex = startIndex + limit;
    return customers.slice(startIndex, endIndex);
  };

  const handleToggleStatus = (customerId) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        customer.id === customerId
          ? { ...customer, isActive: !customer.isActive }
          : customer
      )
    );
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/store/customers")}>Customers</span>{" "}
        <i className="bi bi-chevron-right"></i> Customers List
      </p>

      <div className="row m-0 p-3">
        <div className="col-12">
          <div className="row m-0 mb-3 justify-content-end">
            <div className={`${styles.entity}`} style={{ marginRight: 0 }}>
              <label htmlFor="">Entity :</label>
              <select
                name=""
                id=""
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <table className={`table table-bordered borderedtable`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Last Order On</th>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Area</th>
                <th>Orders</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan={9}>NO DATA FOUND</td>
                </tr>
              ) : (
                getPaginatedData().map((customer, index) => {
                  const actualIndex = (pageNo - 1) * limit + index + 1;
                  return (
                    <tr
                      key={index}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{actualIndex}</td>
                      <td>{customer.lastOrder}</td>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.mobile}</td>
                      <td>{customer.area}</td>
                      <td>{customer.orders}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span 
                            className={`badge ${customer.isActive ? 'bg-success' : 'bg-secondary'}`}
                            style={{ 
                              padding: '4px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {customer.isActive ? <FaUserCheck /> : <FaUserClock />}
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className="form-check form-switch" style={{ margin: 0 }}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={customer.isActive}
                              onChange={() => handleToggleStatus(customer.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/store/customers/${customer.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="row m-0 p-0 pt-3 justify-content-between">
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo > 1 && (
                <button onClick={() => setPageNo(pageNo - 1)}>
                  <span>
                    <FaArrowLeftLong />
                  </span>{" "}
                  Previous
                </button>
              )}
            </div>
            <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
              {pageNo < totalPages && (
                <button onClick={() => setPageNo(pageNo + 1)}>
                  Next{" "}
                  <span>
                    <FaArrowRightLong />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

