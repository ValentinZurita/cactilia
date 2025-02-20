import { FirebaseAuth } from "./firebaseConfig";

// ✅ Obtener el rol del usuario autenticado
export const getUserRole = async () => {
  const user = FirebaseAuth.currentUser;
  if (!user) return "visitor";

  try {
    const idTokenResult = await user.getIdTokenResult(true);
    return idTokenResult.claims.role || "visitor";
  } catch (error) {
    console.error("Error obteniendo el rol:", error);
    return "visitor";
  }
};

