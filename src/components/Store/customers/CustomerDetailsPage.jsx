import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import CustomerTabSection from "./CustomerTabSection";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";

function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      // const res = await axiosAPI.get(`/customers/${id}`);
      // setCustomer(res.data);
      
      // Mock customer data
      const mockCustomer = {
        id: id,
        name: "Rajesh Kumar",
        mobile: "9876543210",
        email: "rajesh.kumar@example.com",
        area: "Downtown",
        address: "123 Main Street, Downtown",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        isActive: true,
        totalOrders: 12,
        totalSpent: 125000,
        lastOrder: "15-01-2024",
        orders: [
          { id: "ORD001", date: "15-01-2024", amount: 15000, status: "Delivered", items: 5 },
          { id: "ORD002", date: "10-01-2024", amount: 12000, status: "Delivered", items: 4 },
          { id: "ORD003", date: "05-01-2024", amount: 18000, status: "Delivered", items: 6 },
          { id: "ORD004", date: "28-12-2023", amount: 9500, status: "Delivered", items: 3 },
          { id: "ORD005", date: "20-12-2023", amount: 22000, status: "Delivered", items: 8 }
        ]
      };
      setCustomer(mockCustomer);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer details");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Loading />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/store/customers")}>Customers</span>{" "}
        <i className="bi bi-chevron-right"></i>{" "}
        <span onClick={() => navigate("/store/customers/list")}>Customers List</span>{" "}
        <i className="bi bi-chevron-right"></i> Customer Details
      </p>

      <div className="p-4">
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '10px', color: 'var(--primary-color)' }}>
            {customer.name}
          </h4>
          <p style={{ fontFamily: 'Poppins', color: '#666', margin: 0 }}>
            {customer.mobile} {customer.email ? `• ${customer.email}` : ''}
          </p>
        </div>

        <CustomerTabSection customer={customer} />
      </div>

      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default CustomerDetailsPage;

