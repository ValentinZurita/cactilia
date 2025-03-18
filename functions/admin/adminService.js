const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");


/*
  ---------------------------
  |  Firebase Admin Service  |
  ---------------------------
 */


// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firebase-adminsdk-fbsvc@cactilia-3678a.iam.gserviceaccount.com",
});

// Firebase Admin Auth
const auth = admin.auth();




/*
  *
  * Assign a custom role to a user.
  *
  * @param {string} userEmail - User email.
  * @param {string} role - Custom role to assign.
  *
  * @returns {Promise<void>} - A promise that resolves when the operation is complete.
  *
  * @example
  * await setCustomRole('adminuser@example.com', 'admin')
  *
 */

async function setCustomRole(userEmail, role) {

  try {

    // 1) Get the user by email
    const user = await auth.getUserByEmail(userEmail);

    // 2) Define the custom claims
    await auth.setCustomUserClaims(user.uid, { role });
    console.log(`Custom claim asignado a ${userEmail}: role = ${role}`);

  } catch (error) {
    console.error('Error asignando custom claims:', error);
  }

}


