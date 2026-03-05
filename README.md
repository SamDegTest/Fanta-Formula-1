# 🏎️ Fanta F1 Custom Manager 🏁

![Versione](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/framework-Next.js-black.svg)
![TailwindCSS](https://img.shields.io/badge/styles-TailwindCSS-38B2AC.svg)

> La dashboard definitiva per gestire la nostra Lega Privata di F1 Fantasy con punteggi aggregati e tornei personalizzati.

---

## 🚀 Panoramica del Progetto
Questa applicazione web nasce per colmare le lacune della piattaforma ufficiale [F1 Fantasy](https://fantasy.formula1.com/). Poiché la nostra lega permette ad ogni partecipante di schierare **2 scuderie**, questa app aggrega automaticamente i punteggi per mostrare una classifica reale per "Team Utente".

### ✨ Caratteristiche Principali
- 📊 **Classifica Aggregata**: Somma automatica dei punti delle due scuderie basata sull'Unique ID utente.
- 🏆 **Sistema Coppa**: Gestione di tornei paralleli con gironi, scontri diretti e fasi finali.
- 📅 **Calendario Dinamico**: Associazione delle giornate di coppa ai Gran Premi reali.
- ⚖️ **Logica della Soglia**: Vittoria assegnata solo se il distacco supera la "Soglia X" definita dall'admin.
- 👤 **Personalizzazione**: Supporto per loghi dei team e soprannomi scelti dai partecipanti.

---

## 🛠️ Stack Tecnologico
* **Frontend**: [Next.js](https://nextjs.org/) (React)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database**: [Supabase](https://supabase.com/) (per la gestione della coppa e calendari)
* **API**: Integrazione con le API ufficiali di F1 Fantasy tramite proxy backend.

---

## ⚙️ Installazione e Configurazione

### 1. Prerequisiti
Assicurati di avere installato **Node.js** (versione 18+) e **npm**.

### 2. Clonazione e Setup
```bash
git clone [https://github.com/tuo-username/fanta-f1-manager.git](https://github.com/tuo-username/fanta-f1-manager.git)
cd fanta-f1-manager
npm install
```

### 3. Variabili d'AmbienteCrea un file .env.local nella root del progetto e inserisci le chiavi recuperate:Snippet di codiceNEXT_PUBLIC_F1_API_KEY=f00df990-2583-49d6-8800-843869288e2c
F1_COOKIE_DATA=IL_TUO_TOKEN_BASE64
LEAGUE_ID=5525807
🎮 Comandi DisponibiliComandoDescrizionenpm run devAvvia il server di sviluppo su http://localhost:3000npm run buildCrea la versione ottimizzata per il deploynpm run startAvvia l'app in modalità produzione🏆 Regolamento della CoppaIl torneo di coppa segue una logica di punteggio "amichevole" per ridurre l'impatto dei micro-distacchi:Vittoria (3pt): Se la differenza punti tra i due sfidanti è maggiore della soglia impostata.Pareggio (1pt): Se la differenza punti è inferiore o uguale alla soglia.Sconfitta (0pt): Se si hanno meno punti dell'avversario oltre la soglia.🤝 ContribuireSe vuoi suggerire nuove funzionalità o segnalare un bug:Apri una Issue descrivendo il problema.Crea un Branch dedicato (feat/nuova-feature).Apri una Pull Request scrivendo Closes #ID_ISSUE nel commento.📝 AutoreCreato con ❤️ per la nostra Lega di F1.Sviluppato da Samuele e il supporto di Google AI Studio.
---

### Perché questo README è "carino" ed efficace?
1.  **Badge**: Gli scudetti in alto danno subito un'aria "pro" e tecnica.
2.  **Blockquotes**: Citazioni e descrizioni brevi aiutano la lettura veloce.
3.  **Tabelle**: I comandi e lo stack sono chiari e facili da consultare.
4.  **Guida .env**: Spiega esattamente cosa fare senza lasciare dubbi.
5.  **Logica di Business**: Spiega agli amici come funziona la "Coppa" direttamente nella documentazione.

**Ti piace?** Se vuoi posso aggiungere una sezione specifica su come configurare **Supabase** se decidi di usarlo per salvare i risultati!

