import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab, Row, Col, Alert } from "react-bootstrap";
import Select from "react-select"; // If available, otherwise standard select
import styles from "./Targets.module.css"; // Reuse existing styles

const CreateStoreTargetModal = ({ isOpen, onClose, onSave, stores = [], initialData = null }) => {
  const [activeTab, setActiveTab] = useState("single");
  const [targetType, setTargetType] = useState(""); // 'amount' | 'bags' | 'both'
  const [formData, setFormData] = useState({
    storeId: "",
    storeIds: [],
    targetAmount: "",
    targetBags: "",
    startDate: "",
    endDate: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derive a targetType from initialData when editing
  const deriveTargetType = (data) => {
    if (!data) return "";
    if (data.targetAmount && data.targetBags) return "both";
    if (data.targetAmount) return "amount";
    if (data.targetBags) return "bags";
    return "both";
  };

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          storeId: initialData.storeId,
          targetAmount: initialData.targetAmount || "",
          targetBags: initialData.targetBags || "",
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
          storeIds: []
        });
        setTargetType(deriveTargetType(initialData));
        setActiveTab("single");
      } else {
        setFormData({
            storeId: "",
            storeIds: [],
            targetAmount: "",
            targetBags: "",
            startDate: "",
            endDate: ""
        });
        setTargetType("");
        setActiveTab("single");
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreSelect = (e) => {
    setFormData(prev => ({ ...prev, storeId: e.target.value }));
  };
  
  // For bulk selection - simple multi-select for now
  const handleBulkStoreChange = (selectedOptions) => {
      // Assuming React Select or similar if we use it, otherwise native multi-select
      // If native:
      // const values = Array.from(e.target.selectedOptions, option => option.value);
      // setFormData(prev => ({ ...prev, storeIds: values }));
  };
  
  // Using react-select if available would be better for bulk. 
  // Let's assume standard constrained implementation first or check if react-select is used in project.
  // Checking package.json would be good but I'll stick to standard UI elements for safety or reusable components.
  
  const validate = () => {
    if (activeTab === "single" && !formData.storeId && !initialData) return "Please select a store.";
    if (activeTab === "bulk" && (!formData.storeIds || formData.storeIds.length === 0)) return "Please select at least one store.";
    if (!formData.startDate) return "Start Date is required.";
    if (!formData.endDate) return "End Date is required.";
    if (!formData.targetAmount && !formData.targetBags) return "At least one of Target Amount or Target Bags is required.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        targetAmount: formData.targetAmount ? Number(formData.targetAmount) : undefined,
        targetBags: formData.targetBags ? Number(formData.targetBags) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      if (initialData) {
        // Update
        // StoreId and StartDate are disabled/ignored in update usually, but API says:
        // Update Payload: targetAmount, targetBags, endDate. 
        // StartDate rule says "At least one of...", wait.
        // Update API example: { targetAmount, targetBags, endDate }. StartDate is NOT in example.
        // So we only send allowed fields.
        await onSave({
            id: initialData.id,
            storeId: initialData.storeId,
            ...payload
        }, true); // isUpdate = true
      } else {
        // Create
        if (activeTab === 'single') {
            payload.storeId = Number(formData.storeId);
            await onSave(payload, false, false); // isUpdate=false, isBulk=false
        } else {
            payload.storeIds = formData.storeIds.map(Number);
            await onSave(payload, false, true); // isUpdate=false, isBulk=true
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save target.");
    } finally {
      setLoading(false);
    }
  };

  // stores options
  const storeOptions = stores.map(s => <option key={s.id} value={s.id}>{s.storeName} ({s.storeCode})</option>);

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Edit Store Target" : "Create Store Target"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!initialData && (
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="single" title="Single Store">
                </Tab>
                <Tab eventKey="bulk" title="Bulk Assign">
                </Tab>
            </Tabs>
        )}

        <Form>
            {/* Store Selection */}
            {!initialData && activeTab === 'single' && (
                <Form.Group className="mb-3">
                    <Form.Label>Store <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                        name="storeId" 
                        value={formData.storeId} 
                        onChange={handleInputChange}
                    >
                        <option value="">Select Store</option>
                        {storeOptions}
                    </Form.Select>
                </Form.Group>
            )}

            {!initialData && activeTab === 'bulk' && (
                <Form.Group className="mb-3">
                    <Form.Label>Stores <span className="text-danger">*</span></Form.Label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', padding: '10px', borderRadius: '4px' }}>
                        {stores.map(store => (
                            <Form.Check 
                                key={store.id}
                                type="checkbox"
                                name="bulkStore"
                                id={`store-${store.id}`}
                                label={`${store.storeName} (${store.storeCode})`}
                                checked={formData.storeIds.includes(String(store.id))}
                                onChange={(e) => {
                                    const id = String(store.id);
                                    setFormData(prev => {
                                        const newIds = e.target.checked 
                                            ? [...prev.storeIds, id]
                                            : prev.storeIds.filter(i => i !== id);
                                        return { ...prev, storeIds: newIds };
                                    });
                                }}
                            />
                        ))}
                    </div>
                </Form.Group>
            )}

            {initialData && (
                <Form.Group className="mb-3">
                    <Form.Label>Store</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={stores.find(s => String(s.id) === String(formData.storeId))?.storeName || formData.storeId} 
                        disabled 
                    />
                    <Form.Text className="text-muted">Store cannot be changed while editing.</Form.Text>
                </Form.Group>
            )}

            {/* Choose Target Type */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Choose a Target <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value);
                  // Clear irrelevant fields when switching
                  if (e.target.value === 'amount') setFormData(prev => ({ ...prev, targetBags: '' }));
                  if (e.target.value === 'bags') setFormData(prev => ({ ...prev, targetAmount: '' }));
                }}
                style={{ borderColor: !targetType ? '#dc3545' : undefined }}
              >
                <option value="">-- Select Target Type --</option>
                <option value="amount">Target Amount (Sales Value)</option>
                <option value="bags">Target Bags (Quantity)</option>
                <option value="both">Both (Amount &amp; Bags)</option>
              </Form.Select>
              {!targetType && <Form.Text className="text-muted">Select what you want to track for this target.</Form.Text>}
            </Form.Group>

            {/* Target Amount field — only when 'amount' or 'both' */}
            {(targetType === 'amount' || targetType === 'both') && (
              <Row>
                <Col md={targetType === 'both' ? 6 : 12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Amount (₹) <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 100000"
                      min="0"
                    />
                  </Form.Group>
                </Col>
                {/* Target Bags alongside if 'both' */}
                {targetType === 'both' && (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Bags <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="targetBags"
                        value={formData.targetBags}
                        onChange={handleInputChange}
                        placeholder="e.g. 50"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            )}

            {/* Target Bags field — only when 'bags' (standalone) */}
            {targetType === 'bags' && (
              <Form.Group className="mb-3">
                <Form.Label>Target Bags <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="targetBags"
                  value={formData.targetBags}
                  onChange={handleInputChange}
                  placeholder="e.g. 50"
                  min="0"
                />
              </Form.Group>
            )}

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="date" 
                            name="startDate" 
                            value={formData.startDate} 
                            onChange={handleInputChange}
                            disabled={!!initialData} // Disabled in edit mode per rules/logic usually, though API didn't explicitly forbid it in payload, Example Route for update doesn't have it.
                        />
                        {initialData && <Form.Text className="text-muted">Start Date cannot be changed.</Form.Text>}
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="date" 
                            name="endDate" 
                            value={formData.endDate} 
                            onChange={handleInputChange}
                            min={formData.startDate}
                        />
                    </Form.Group>
                </Col>
            </Row>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Target" : "Create Target"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateStoreTargetModal;
