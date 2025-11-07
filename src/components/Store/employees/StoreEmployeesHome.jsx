import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";

export default function StoreEmployeesHome() {
  const navigate = useNavigate();

  const mockEmployeesData = {
    total: 25,
    managers: 3,
    staff: 22,
    presentToday: 24,
    onLeave: 1,
    recentEmployees: [
      { id: "EMP001", name: "Rajesh Kumar", mobile: "9876543210", email: "rajesh@example.com", sales: 45, role: "Manager" },
      { id: "EMP002", name: "Priya Sharma", mobile: "9876543211", email: "priya@example.com", sales: 38, role: "Sales Executive" },
      { id: "EMP003", name: "Amit Singh", mobile: "9876543212", email: "amit@example.com", sales: 32, role: "Sales Executive" },
      { id: "EMP004", name: "Sneha Patel", mobile: "9876543213", email: "sneha@example.com", sales: 28, role: "Sales Executive" },
      { id: "EMP005", name: "Vikram Mehta", mobile: "9876543214", email: "vikram@example.com", sales: 22, role: "Sales Executive" }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          fontSize: '28px', 
          color: 'var(--primary-color)',
          margin: 0,
          marginBottom: '8px'
        }}>Employee Management</h2>
        <p style={{ 
          fontFamily: 'Poppins', 
          fontSize: '14px', 
          color: '#666',
          margin: 0
        }}>Manage your employees and track performance</p>
      </div>

      {/* Action Buttons */}
      <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
        <div className="col" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="homebtn" 
            onClick={() => navigate('/store/employees/create')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Create Employee
          </button>
          <button 
            className="homebtn" 
            onClick={() => navigate('/store/employees/list')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', lineHeight: '1' }}
          >
            Employees List
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Flex wrap="wrap" justify="space-between" px={2} style={{ marginBottom: '24px' }}>
        <ReusableCard title="Managers" value={mockEmployeesData.managers.toString()} />
        <ReusableCard title="Staff" value={mockEmployeesData.staff.toString()} color="blue.500" />
        <ReusableCard title="Present Today" value={mockEmployeesData.presentToday.toString()} color="green.500" />
        <ReusableCard title="On Leave" value={mockEmployeesData.onLeave.toString()} color="yellow.500" />
      </Flex>
    </div>
  );
}

