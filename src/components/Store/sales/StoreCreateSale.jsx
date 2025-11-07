import React, { useMemo, useState } from "react";
import ApiService from "../../../services/apiService";

const styles = {
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    boxShadow: '1px 1px 3px #333',
    gap: '12px',
    flexWrap: 'wrap'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  stepItemActive: {
    backgroundColor: 'var(--primary-color)',
    color: 'white'
  },
  stepItemCompleted: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  stepItemPending: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6'
  },
  stepNumber: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold'
  }
};

function StepIndicator({ step, steps }) {
  const meta = steps.map((title, idx) => ({
    number: idx + 1,
    title,
    description:
      title === 'Number' ? 'Enter mobile number' :
      title === 'Products' ? 'Add products to cart' :
      title === 'Review' ? 'Review order details' :
      'Payment information'
  }));

  return (
    <div style={styles.stepIndicator}>
      {meta.map((item, index) => {
        let stepStyle = { ...styles.stepItem };
        if (index < step) stepStyle = { ...stepStyle, ...styles.stepItemCompleted };
        else if (index === step) stepStyle = { ...stepStyle, ...styles.stepItemActive };
        else stepStyle = { ...stepStyle, ...styles.stepItemPending };

        return (
          <div key={item.title} style={stepStyle}>
            <div style={styles.stepNumber}>{index < step ? '✓' : item.number}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.title}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{item.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StoreCreateSale() {
  const [step, setStep] = useState(0);

  // Step 1: mobile number
  const [mobile, setMobile] = useState("");
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [checking, setChecking] = useState(false);

  // Fixed steps like admin style: Number, Products, Review, Payment
  const steps = useMemo(() => ['Number', 'Products', 'Review', 'Payment'], []);

  // Step 2: customer form (only if not exists)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    mobile: "",
    email: "",
    area: "",
    city: "",
    pincode: "",
  });
  const [readonlyExisting, setReadonlyExisting] = useState(true);
  const [customerChecked, setCustomerChecked] = useState(false);

  // Steps 3-5 placeholders
  const [cartItems, setCartItems] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [payments, setPayments] = useState([]);

  const canGoNext = () => {
    if (step === 0) return mobile.length === 10;
    if (step === 1) return existingCustomer || (customerForm.name && customerForm.mobile.length === 10);
    if (step === 2) return cartItems.length > 0 || true; // allow progression for now
    if (step === 3) return true;
    return false;
  };

  const handleCheckMobile = async (mobileNumber = mobile) => {
    console.log('handleCheckMobile called with mobileNumber:', mobileNumber, 'length:', mobileNumber.length);
    if (mobileNumber.length !== 10) {
      console.log('Mobile length is not 10, returning');
      return;
    }
    try {
      console.log('Setting checking to true');
      setChecking(true);
      setCustomerChecked(false);
      console.log('Checking customer for mobile:', mobileNumber);
      
      // Make actual API call
      const resp = await ApiService.get(`/customers?mobile=${mobileNumber}`);
      let customers = [];
      if (resp && typeof resp.json === 'function') {
        const data = await resp.json();
        console.log('API response:', data);
        customers = Array.isArray(data?.customers) ? data.customers : [];
      }
      
      // Fallback: fetch all and match by mobile
      if (!customers.length) {
        console.log('Falling back to /customers list fetch');
        const allResp = await ApiService.get(`/customers`);
        if (allResp && typeof allResp.json === 'function') {
          const allData = await allResp.json();
          const all = Array.isArray(allData?.customers) ? allData.customers : [];
          customers = all.filter((c) => String(c.mobile || '').replace(/\D/g, '') === mobileNumber);
        }
      }
      
      if (customers.length > 0) {
        const customer = customers[0];
        console.log('Customer found:', customer);
        setExistingCustomer(customer);
        setCustomerForm({
          name: customer.name || "",
          mobile: customer.mobile || mobileNumber,
          email: customer.email || "",
          area: customer.area || "",
          city: customer.city || "",
          pincode: customer.pincode || "",
        });
        setReadonlyExisting(true);
      } else {
        console.log('No customer found');
        setExistingCustomer(null);
        setCustomerForm((f) => ({ ...f, mobile: mobileNumber }));
      }
      setCustomerChecked(true);
    } catch (error) {
      console.error('Error checking customer:', error);
      setExistingCustomer(null);
      setCustomerForm((f) => ({ ...f, mobile: mobileNumber }));
      setCustomerChecked(true);
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div style={{ padding: 12 }}>
      <h4 style={{ marginBottom: 8 }}>Create Sale</h4>
      <StepIndicator step={step} steps={steps} />

      {steps[step] === 'Number' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Enter Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              console.log('Mobile input changed:', val, 'length:', val.length);
              setMobile(val);
              setCustomerChecked(false);
              setExistingCustomer(null);
              if (val.length === 10) {
                console.log('10 digits entered, calling handleCheckMobile with val:', val);
                // Call handleCheckMobile with the value directly
                handleCheckMobile(val);
              }
            }}
            placeholder="10-digit mobile number"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          {checking && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>Checking customer...</div>
          )}

          {/* Show existing customer details */}
          {customerChecked && existingCustomer && (
            <div style={{ marginTop: 16, padding: 12, background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>Existing Customer Found</div>
              <div style={{ fontSize: 14 }}>
                <div><strong>Name:</strong> {existingCustomer.name}</div>
                <div><strong>Mobile:</strong> {existingCustomer.mobile}</div>
                {existingCustomer.email && <div><strong>Email:</strong> {existingCustomer.email}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-secondary" onClick={next}>Continue</button>
              </div>
            </div>
          )}

          {/* Show no customer message and new customer form */}
          {customerChecked && !existingCustomer && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>No customer exists with this mobile number</div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Create New Customer</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input 
                    value={customerForm.name} 
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} 
                    placeholder="Name *" 
                    className="form-control" 
                    required
                  />
                  <input 
                    value={customerForm.mobile} 
                    onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} 
                    placeholder="Mobile Number *" 
                    className="form-control" 
                    required
                  />
                  <input 
                    value={customerForm.email} 
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} 
                    placeholder="Email (optional)" 
                    className="form-control" 
                  />
                  <input 
                    value={customerForm.area} 
                    onChange={(e) => setCustomerForm({ ...customerForm, area: e.target.value })} 
                    placeholder="Area *" 
                    className="form-control" 
                    required
                  />
                  <input 
                    value={customerForm.city} 
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} 
                    placeholder="City *" 
                    className="form-control" 
                    required
                  />
                  <input 
                    value={customerForm.pincode} 
                    onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })} 
                    placeholder="Pincode *" 
                    className="form-control" 
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-primary">Submit</button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={next} 
                    disabled={!(customerForm.name && customerForm.mobile.length === 10 && customerForm.area && customerForm.city && customerForm.pincode.length === 6)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {steps[step] === 'Products' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Products</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Products selection UI will be added here.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={next}>Continue</button>
            <button className="btn btn-light" onClick={prev}>Back</button>
          </div>
        </div>
      )}

      {steps[step] === 'Review' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Review</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Review details UI will be added here.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={next}>Continue</button>
            <button className="btn btn-light" onClick={prev}>Back</button>
          </div>
        </div>
      )}

      {steps[step] === 'Payment' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Payment</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Payment UI will be added here (single/multiple payments, proof, status, etc.).</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-primary">Finalize Order</button>
            <button className="btn btn-light" onClick={prev}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}


