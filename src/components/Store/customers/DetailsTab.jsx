import React from "react";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaShoppingCart, FaRupeeSign } from "react-icons/fa";

function DetailsTab({ customer }) {
  if (!customer) {
    return null;
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      padding: '20px',
      marginTop: '20px',
      fontFamily: 'Poppins'
    }}>
      <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '20px', color: 'var(--primary-color)' }}>
        Customer Information
      </h5>
      
      <div className="row">
        <div className="col-md-6" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaUser style={{ color: 'var(--primary-color)' }} />
            <strong>Name:</strong>
          </div>
          <p style={{ marginLeft: '28px', margin: 0, color: '#666' }}>{customer.name}</p>
        </div>

        <div className="col-md-6" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaPhone style={{ color: 'var(--primary-color)' }} />
            <strong>Mobile:</strong>
          </div>
          <p style={{ marginLeft: '28px', margin: 0, color: '#666' }}>{customer.mobile}</p>
        </div>

        {customer.email && (
          <div className="col-md-6" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaEnvelope style={{ color: 'var(--primary-color)' }} />
              <strong>Email:</strong>
            </div>
            <p style={{ marginLeft: '28px', margin: 0, color: '#666' }}>{customer.email}</p>
          </div>
        )}

        <div className="col-md-6" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaMapMarkerAlt style={{ color: 'var(--primary-color)' }} />
            <strong>Area:</strong>
          </div>
          <p style={{ marginLeft: '28px', margin: 0, color: '#666' }}>{customer.area || 'N/A'}</p>
        </div>

        {customer.address && (
          <div className="col-md-12" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FaMapMarkerAlt style={{ color: 'var(--primary-color)' }} />
              <strong>Address:</strong>
            </div>
            <p style={{ marginLeft: '28px', margin: 0, color: '#666' }}>{customer.address}</p>
          </div>
        )}

        {customer.city && (
          <div className="col-md-6" style={{ marginBottom: '16px' }}>
            <strong>City:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>{customer.city}</p>
          </div>
        )}

        {customer.state && (
          <div className="col-md-6" style={{ marginBottom: '16px' }}>
            <strong>State:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>{customer.state}</p>
          </div>
        )}

        {customer.pincode && (
          <div className="col-md-6" style={{ marginBottom: '16px' }}>
            <strong>Pincode:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>{customer.pincode}</p>
          </div>
        )}

        <div className="col-md-6" style={{ marginBottom: '16px' }}>
          <strong>Status:</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            <span className={`badge ${customer.isActive ? 'bg-success' : 'bg-secondary'}`}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        paddingTop: '20px', 
        borderTop: '1px solid #e5e7eb' 
      }}>
        <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: '20px', color: 'var(--primary-color)' }}>
          Statistics
        </h5>
        <div className="row">
          <div className="col-md-4" style={{ marginBottom: '16px' }}>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <FaShoppingCart style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }} />
              <h6 style={{ margin: '8px 0 4px 0', fontFamily: 'Poppins', fontWeight: 600 }}>
                {customer.totalOrders || 0}
              </h6>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Orders</p>
            </div>
          </div>

          <div className="col-md-4" style={{ marginBottom: '16px' }}>
            <div style={{ 
              background: 'rgba(5, 150, 105, 0.1)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <FaRupeeSign style={{ fontSize: '24px', color: '#059669', marginBottom: '8px' }} />
              <h6 style={{ margin: '8px 0 4px 0', fontFamily: 'Poppins', fontWeight: 600 }}>
                ₹{(customer.totalSpent || 0).toLocaleString()}
              </h6>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Spent</p>
            </div>
          </div>

          <div className="col-md-4" style={{ marginBottom: '16px' }}>
            <div style={{ 
              background: 'rgba(217, 119, 6, 0.1)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <FaMapMarkerAlt style={{ fontSize: '24px', color: '#d97706', marginBottom: '8px' }} />
              <h6 style={{ margin: '8px 0 4px 0', fontFamily: 'Poppins', fontWeight: 600 }}>
                {customer.lastOrder || 'N/A'}
              </h6>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Last Order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsTab;

