
export const StatusMessage = ({ loading, error }) => {

  if (loading) {
    return (
      <div className="text-center my-4">
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-4 text-danger">
        <p>Error al cargar productos: {error}</p>
      </div>
    );
  }

  return null;

};