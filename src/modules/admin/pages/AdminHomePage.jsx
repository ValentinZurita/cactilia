/*
  *
  * +----------------------+
  * |                      |
  * |  AdminHomePage       |
  * |                      |
  * +----------------------+
  *
 */

import React from 'react';
// Remove unused imports for Firebase Functions and useState
// import { useState } from 'react'; 
// import { getFunctions, httpsCallable } from "firebase/functions";

export const AdminHomePage = () => {
  // Remove state and handler function
  // const [loadingSetupUsers, setLoadingSetupUsers] = useState(false);
  // const handleSetupDemoUsers = async () => { ... };

  return (
    <div>
      <h1>Bienvenido al Panel de Administración</h1>

      {/* Remove Development Tools section 
      <hr /> 
      <h2>Herramientas de Desarrollo</h2>
      <button 
        className="btn btn-warning mt-3" 
        onClick={handleSetupDemoUsers}
        disabled={loadingSetupUsers}
      >
        {loadingSetupUsers ? "Configurando..." : "Configurar Usuarios Demo"}
      </button>
      <p className="text-muted small mt-2">
        Este botón ejecuta la función para crear/restablecer usuarios de demostración. Úsalo con precaución.
      </p>
      */}
    </div>
  );
};