// src/lib/deviceToken.js
// Identifiant aléatoire propre à ce navigateur, créé une seule fois et
// réutilisé pour tout ce qui doit reconnaître "cet appareil" sans compte :
// anti-transfert de lien de défi (challenges.js, rematches.js) et limite
// anti-abus de création de grilles partagées (sharedGrids.js). Extrait ici
// pour ne pas dupliquer une 3ᵉ fois la même fonction.
const DEVICE_TOKEN_KEY = 'sudoku-devoile:deviceToken';

export function getOrCreateDeviceToken() {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return crypto.randomUUID(); // pas de stockage possible : token jetable
  }
}
