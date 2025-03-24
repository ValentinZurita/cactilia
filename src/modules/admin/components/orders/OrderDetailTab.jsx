export const OrderDetailTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'products', label: 'Productos', icon: 'box' },
    { id: 'customer', label: 'Cliente', icon: 'person' },
    { id: 'payment', label: 'Pago', icon: 'credit-card' },
    { id: 'status', label: 'Historial', icon: 'clock-history' }
  ];

  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map(tab => (
        <li key={tab.id} className="nav-item">
          <button
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi bi-${tab.icon} me-2`}></i>
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
};