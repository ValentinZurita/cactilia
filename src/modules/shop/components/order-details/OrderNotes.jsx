export const OrderNotes = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="order-notes-section">
      <h3>Notas del Pedido</h3>
      <div className="order-notes-content">
        <i className="bi bi-chat-left-text me-2"></i>
        {notes}
      </div>
    </div>
  );
};
