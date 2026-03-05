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

### 3. Variabili d'AmbienteCrea un file .env.local nella root del progetto e inserisci le chiavi recuperate:
```bash
NEXT_PUBLIC_F1_API_KEY=f00df990-2583-49d6-8800-843869288e2c
F1_COOKIE_DATA=IL_TUO_TOKEN_BASE64
LEAGUE_ID=5525807
```

