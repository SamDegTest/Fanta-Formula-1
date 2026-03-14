// --- CONFIGURAZIONE SQUADRE STATICHE ---
// Aggiungi qui le associazioni tra nome utente e nome/logo squadra personalizzato.
// La chiave deve essere parte del nome utente o nome reale (tutto in minuscolo).
export const CUSTOM_TEAMS: Record<string, { name: string, logo?: string, boosters?: Record<string, number> }> = {
  "federico russo": {
    name: "AvvocatoSenior F1 team",
  },
  "domenico ghionda": {
    name: "Habibi motorsport F1 team",
  },
  "raul sisto": {
    name: "Legione del centauro",
  },
  "elena russo": {
    name: "Nenacrochet",
  },
  "gianluca tunzi": {
    name: "Tunzi Hyperflux Racing",
  },
  "Vittorio Sisto":{
    name: "Beavers"
  },
  "Luca Siciliani":{
    name: "Scuderia Sbinnati"
  },
  "Valerio Maniscalco":{
    name: "Speed and Power"
  },
  "Christian Busco":{
    name: "Dinoco F1 team"
  },
  "Piergiorgio Tunzi":{
    name: "Alette"
  },
  "Francesco Tullo":{
    name: "MERDECESS AMG FORMULA 1 TEAM"
  },
  "Davide Milella":{
    name: "Cavallino Arrapante"
  },
  "Eryk Karwasinskí":{
    name: "G. Mazzoni Gufo Racing"
  }
};

export const getCustomTeamInfo = (username?: string, name?: string) => {
  const searchStr = `${username || ''} ${name || ''}`.toLowerCase();
  
  for (const [key, info] of Object.entries(CUSTOM_TEAMS)) {
    if (searchStr.includes(key.toLowerCase())) {
      return info;
    }
  }
  return null;
};
