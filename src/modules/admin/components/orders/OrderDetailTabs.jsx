import React, { useState } from 'react';

export const OrderDetailTabs = ({ activeTab, setActiveTab }) => {

  const [hoveredTab, setHoveredTab] = useState(null);

  const tabs = [
    { id: 'products', label: 'Productos', icon: 'box' },
    { id: 'customer', label: 'Cliente', icon: 'person' },
    { id: 'payment', label: 'Pago', icon: 'credit-card' },
    { id: 'status', label: 'Historial', icon: 'clock-history' },
    { id: 'notes', label: 'Notas', icon: 'journal-text' }
  ];

  return (
    <nav className="nav nav-tabs flex-nowrap mb-4 overflow-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-link border-0 ${
            activeTab === tab.id
              ? 'active bg-dark text-white fw-medium'
              : hoveredTab === tab.id
                ? 'bg-dark text-white'
                : 'text-secondary'
          }`}
          onClick={() => setActiveTab(tab.id)}
          onMouseEnter={() => setHoveredTab(tab.id)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          <i className={`bi bi-${tab.icon} me-2 ${activeTab === tab.id || hoveredTab === tab.id ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};