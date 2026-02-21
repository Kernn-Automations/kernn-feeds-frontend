import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Tabs, Tab, Row, Col, Alert } from "react-bootstrap";
import styles from "./Targets.module.css";

const CreateStoreTargetModal = ({ isOpen, onClose, onSave, stores = [], initialData = null }) => {
  const [activeTab, setActiveTab] = useState("single");
  const [singleSearch, setSingleSearch] = useState("");
  const [bulkSearch, setBulkSearch] = useState("");
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
        setActiveTab("single");
      }
      setSingleSearch("");
      setBulkSearch("");
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filtered stores for single tab
  const filteredSingleStores = useMemo(() =>
    stores.filter(s =>
      `${s.storeName} ${s.storeCode}`.toLowerCase().includes(singleSearch.toLowerCase())
    ), [stores, singleSearch]);

  // Filtered stores for bulk tab
  const filteredBulkStores = useMemo(() =>
    stores.filter(s =>
      `${s.storeName} ${s.storeCode}`.toLowerCase().includes(bulkSearch.toLowerCase())
    ), [stores, bulkSearch]);

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
        await onSave({
          id: initialData.id,
          storeId: initialData.storeId,
          ...payload
        }, true);
      } else {
        if (activeTab === 'single') {
          payload.storeId = Number(formData.storeId);
          await onSave(payload, false, false);
        } else {
          payload.storeIds = formData.storeIds.map(Number);
          await onSave(payload, false, true);
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

  // Selected store label for single tab
  const selectedStoreName = formData.storeId
    ? stores.find(s => String(s.id) === String(formData.storeId))
    : null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Edit Store Target" : "Create Store Target"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {!initialData && (
          <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setSingleSearch(""); setBulkSearch(""); }} className="mb-3">
            <Tab eventKey="single" title="Single Store" />
            <Tab eventKey="bulk" title="Bulk Assign" />
          </Tabs>
        )}

        <Form>
          {/* ── Single Store selector with search ── */}
          {!initialData && activeTab === 'single' && (
            <Form.Group className="mb-3">
              <Form.Label>Store <span className="text-danger">*</span></Form.Label>

              {/* Search input */}
              <Form.Control
                type="text"
                placeholder=" Search store..."
                value={singleSearch}
                onChange={(e) => setSingleSearch(e.target.value)}
                className="mb-2"
              />

              {/* Scrollable list */}
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                padding: '6px 0'
              }}>
                {filteredSingleStores.length === 0 && (
                  <div className="text-muted text-center py-2" style={{ fontSize: '13px' }}>No stores found</div>
                )}
                {filteredSingleStores.map(store => (
                  <div
                    key={store.id}
                    onClick={() => setFormData(prev => ({ ...prev, storeId: String(store.id) }))}
                    style={{
                      padding: '8px 14px',
                      cursor: 'pointer',
                      backgroundColor: String(formData.storeId) === String(store.id) ? '#0d6efd' : 'transparent',
                      color: String(formData.storeId) === String(store.id) ? '#fff' : 'inherit',
                      borderRadius: '4px',
                      margin: '0 4px',
                      fontSize: '14px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (String(formData.storeId) !== String(store.id))
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      if (String(formData.storeId) !== String(store.id))
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="fw-medium">{store.storeName}</span>
                    <span className="ms-2 text-muted" style={{ fontSize: '12px' }}>({store.storeCode})</span>
                  </div>
                ))}
              </div>

              {/* Selected store badge */}
              {selectedStoreName && (
                <div className="mt-2 text-success" style={{ fontSize: '13px' }}>
                  ✓ Selected: <strong>{selectedStoreName.storeName}</strong> ({selectedStoreName.storeCode})
                </div>
              )}
            </Form.Group>
          )}

          {/* ── Bulk Store selector with search ── */}
          {!initialData && activeTab === 'bulk' && (
            <Form.Group className="mb-3">
              <Form.Label>
                Stores <span className="text-danger">*</span>
                {formData.storeIds.length > 0 && (
                  <span className="badge bg-primary ms-2">{formData.storeIds.length} selected</span>
                )}
              </Form.Label>

              {/* Search + select-all row */}
              <div className="d-flex gap-2 mb-2 align-items-center">
                <Form.Control
                  type="text"
                  placeholder="🔍 Search stores..."
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    const allIds = filteredBulkStores.map(s => String(s.id));
                    const allSelected = allIds.every(id => formData.storeIds.includes(id));
                    setFormData(prev => ({
                      ...prev,
                      storeIds: allSelected
                        ? prev.storeIds.filter(id => !allIds.includes(id))
                        : [...new Set([...prev.storeIds, ...allIds])]
                    }));
                  }}
                  style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
                >
                  {filteredBulkStores.every(s => formData.storeIds.includes(String(s.id))) && filteredBulkStores.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>

              {/* Scrollable checkbox list */}
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #ced4da',
                padding: '10px',
                borderRadius: '6px'
              }}>
                {filteredBulkStores.length === 0 && (
                  <div className="text-muted text-center py-2" style={{ fontSize: '13px' }}>No stores found</div>
                )}
                {filteredBulkStores.map(store => (
                  <Form.Check
                    key={store.id}
                    type="checkbox"
                    id={`store-${store.id}`}
                    label={`${store.storeName} (${store.storeCode})`}
                    checked={formData.storeIds.includes(String(store.id))}
                    onChange={(e) => {
                      const id = String(store.id);
                      setFormData(prev => ({
                        ...prev,
                        storeIds: e.target.checked
                          ? [...prev.storeIds, id]
                          : prev.storeIds.filter(i => i !== id)
                      }));
                    }}
                    className="mb-1"
                  />
                ))}
              </div>
            </Form.Group>
          )}

          {/* Edit mode — show current store (read-only) */}
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

          {/* Target Amount & Target Bags — always visible */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Target Amount (₹)</Form.Label>
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Target Bags</Form.Label>
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
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={!!initialData}
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
