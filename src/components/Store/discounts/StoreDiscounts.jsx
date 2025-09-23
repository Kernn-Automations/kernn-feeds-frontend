import React from "react";

export default function StoreDiscounts() {
  return (
    <div>
      <h4>Discounting</h4>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn btn-outline-primary">Discounting Rules</button>
      </div>

      {/* Mini Dashboards */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 500 }}>
        <h6>Active Rules</h6>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Seasonal discount - 5%</li>
          <li>Bulk purchase - 3%</li>
        </ul>
      </div>
    </div>
  );
}
