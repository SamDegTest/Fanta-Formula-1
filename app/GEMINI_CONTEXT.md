# 🚀 CONTESTO DI PROGETTO: FANTA F1 CUSTOM MANAGER

## 📌 Obiettivo del Progetto
Sviluppare una Web App avanzata per la gestione personalizzata di una lega privata di F1 Fantasy. L'app funge da dashboard per circa 15 utenti, permettendo calcoli aggregati e la creazione di tornei dinamici non presenti sulla piattaforma ufficiale.

## 🛠️ Logica di Business Fondamentale
1. **Aggregazione Punteggi**: Ogni utente (`user_guid`) può possedere fino a 2 scuderie. L'app deve sommare i punti di entrambe per mostrare una classifica singola per "Team Utente".
2. **Personalizzazione Utente**: Ogni partecipante ha un **Soprannome Squadra** e un **Logo personalizzato** mappati sul proprio `user_guid`. Questi dati devono avere la priorità visiva sui dati grezzi dell'API.

## 🏆 MODULO GESTIONE COPPA (DETTAGLI AVANZATI)
Il sistema deve gestire un workflow completo, dalla configurazione iniziale alla fase finale.

### **1. Workflow di Creazione (Form Wizard)**
Se non esistono coppe, mostrare un tasto **"Crea Nuova Coppa"**. Il form di creazione deve permettere la personalizzazione totale:
- **Informazioni**: Nome della coppa (es. "Coppa del Nonno F1").
- **Partecipanti**: Selezione manuale dei team della lega che prenderanno parte al torneo.
- **Struttura Torneo**: 
    - Scelta tra **Solo Gironi**, **Solo Scontri Diretti** (Eliminazione), o **Sistema Misto**.
    - Configurazione Fasi: Opzione per abilitare/disabilitare Quarti, Semifinali e Finale.
- **Regole e Calendario**: 
    - Impostazione della **Soglia di Vittoria** (Delta punti necessario per i 3pt).
    - Selezione delle **Giornate/GP** ufficiali validi per ogni turno della coppa.

### **2. Dashboard della Coppa**
Una volta creata, la coppa deve mostrare:
- **Classifica**: Punti, vittorie, pareggi, sconfitte e punti Fanta F1 totali.
- **Next Match**: Box in evidenza con lo scontro della prossima giornata/GP.
- **Tabellone (Bracket)**: Un tasto per visualizzare graficamente l'intero schema del torneo (dai gironi alla finale).

## 🎨 Requisiti Grafici e UX/UI (Mandatori)
- **Stile Moderno**: Ispirazione "Racing/F1". Dark mode obbligatoria, accenti Rosso F1 (#E10600).
- **Esperienza Utente (UX)**:
    - **Form Evoluti**: Uso di toggle, slider per la soglia e selettori visivi per i team.
    - **Visualizzazione Tabellone**: Il bracket deve essere interattivo, responsive e supportare lo scroll laterale su mobile.
    - **Componenti**: Uso di Card con effetto "Glassmorphism", Skeleton loaders per i caricamenti e animazioni fluide (es. Framer Motion).
    - **Feedback**: Transizioni curate tra la lista delle coppe e la dashboard singola.

## 💻 Stack Tecnologico
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) per salvare configurazioni coppe, gironi e risultati.
- **Integrazione API**: Fetching dei dati da `fantasy-api.formula1.com/partner_games/f1` usando gli header `apiKey` e `x-f1-cookie-data`.

---
**Istruzione per Gemini**: Quando generi codice o suggerisci modifiche in VS Code, consulta sempre questo file. Ogni componente deve essere funzionale ma anche esteticamente "Premium" e moderno, rispettando rigorosamente la logica di aggregazione punti e la flessibilità del modulo Coppa.