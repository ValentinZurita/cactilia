// src/firebase/authUtils.js

import { FirebaseAuth } from "./firebaseConfig";

// Get the user's role from Firebase Auth
export const getUserRole = async () => {
  const user = FirebaseAuth.currentUser;
  if (!user) return "visitor";

  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.role || "visitor";
  } catch (error) {
    console.error("Error obteniendo el rol:", error);
    return "visitor";
  }
};