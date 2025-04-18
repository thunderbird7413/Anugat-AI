import React from "react";

export default function Button({ children, onClick }) {
  return (
    <button
      style={{
        background: "#1976d2",
        color: "white",
        padding: "0.75rem 2rem",
        fontSize: "1rem",
        borderRadius: "2rem",
        // boxShadow: "0 0 10px #00c9a7",
        border: "none",
        cursor: "pointer",
        transition: "0.3s ease",
      }}
      onClick={onClick}
      onMouseOver={(e) => (e.target.style.opacity = 0.85)}
      onMouseOut={(e) => (e.target.style.opacity = 1)}
    >
      {children}
    </button>
  );
}
