import React, { useState } from "react";

const CustomSearchDropdown = ({ label, options = [], onSelect }) => {
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  // Sort options alphabetically by label (case-insensitive)
  const sortedOptions = [...options].sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase())
  );

  // Filter based on search text
  const filtered = sortedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="col-4 formcontent" style={{ position: "relative" }}>
      <label>{label}:</label>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 200)}
        placeholder="Select or Type"
      />
      {showOptions && (
        <ul
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            zIndex: 999,
            background: "white",
            width: "260px",
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: "10px",
            boxShadow: "2px 2px 4px #333",
            padding: "0",
            margin: "0",
            listStyle: "none",
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <li
                key={opt.value}
                onMouseDown={() => {
                  setSearch(opt.label);
                  onSelect(opt.value);
                  setShowOptions(false);
                }}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f1f1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li style={{ padding: "5px 10px", fontSize: "14px" }}>No results</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSearchDropdown;
