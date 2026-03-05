import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// Forza la route ad essere dinamica per evitare che Next.js la "congeli" (Static Generation)
export const dynamic = 'force-dynamic';

const TEAM_FOLDER_ID = process.env.TEAM_FOLDER_ID;
const LEAGUE_FOLDER_ID = process.env.LEAGUE_FOLDER_ID;

// Inizializza l'autenticazione Google
const getAuth = () => {
  try {
    // 1. Prova a leggere il JSON completo dalla variabile d'ambiente (Netlify/Prod)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      let jsonContent = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim();
      
      // Fix: Rimuove apici singoli o doppi se l'utente li ha inclusi nella stringa (errore comune .env)
      if ((jsonContent.startsWith("'") && jsonContent.endsWith("'")) || 
          (jsonContent.startsWith('"') && jsonContent.endsWith('"'))) {
        jsonContent = jsonContent.slice(1, -1);
      }

      let credentials;
      try {
        credentials = JSON.parse(jsonContent);
      } catch (e) {
        console.error("Errore parsing JSON credenziali. Tentativo di pulizia...", e);
        // Tentativo estremo: a volte i copy-paste inseriscono caratteri di escape errati
        const sanitized = jsonContent.replace(/\\n/g, '\n');
        credentials = JSON.parse(sanitized);
      }

      return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    }

    // 2. Fallback: Prova a leggere le singole variabili (Legacy/Local)
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      return new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    }
    
    console.error("ERRORE CRITICO: Credenziali Google Drive mancanti (GOOGLE_APPLICATION_CREDENTIALS_JSON).");
    return null;
  } catch (error) {
    console.error("Errore di inizializzazione Google Auth:", error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'team' | 'league'
  const name = searchParams.get('name');

  if (!type || !name) {
    return new NextResponse('Missing type or name', { status: 400 });
  }

  const folderId = type === 'team' ? TEAM_FOLDER_ID : LEAGUE_FOLDER_ID;

  const auth = getAuth();
  if (!auth) {
    return new NextResponse('Auth configuration missing', { status: 500 });
  }

  console.log(`[DRIVE-API] Richiesta: Type=${type}, Name="${name}"`);

  try {
    const drive = google.drive({ version: 'v3', auth });
    
    // Cerca tutti i file nella cartella per permettere un match case-insensitive
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
    });

    const files = res.data.files || [];
    
    // Normalizzazione del nome per il confronto
    const nameTrimmed = name.trim();
    
    // Strategia 1: Sostituzione semplice spazi -> underscore (es. "Team A" -> "Team_A")
    const strategySimple = nameTrimmed.replace(/\s+/g, '_');
    
    // Strategia 2: Sanitizzazione completa (es. "Team A & B" -> "Team_A_B")
    // Rimuove caratteri speciali e gestisce underscore multipli
    const strategySanitized = nameTrimmed.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');

    // Strategia 3: Nome originale (es. "Piston League" -> "piston league")
    // Utile se il file su Drive ha gli spazi invece degli underscore
    const strategyOriginal = nameTrimmed;

    console.log(`[DRIVE-API] Cerco match per: "${strategySimple}" (Priority) OR "${strategySanitized}" OR "${strategyOriginal}"`);

    // Helper per normalizzare il nome del file da Drive
    const getNormalizedFileName = (f: any) => {
      if (!f.name) return '';
      const fileNameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
      return fileNameWithoutExt.trim().toLowerCase();
    };

    // Ricerca sequenziale per priorità
    // 1. Priorità assoluta: Nome con underscore (es. "piston_league")
    let file = files.find(f => getNormalizedFileName(f) === strategySimple.toLowerCase());

    // 2. Fallback: Nome sanitizzato (es. "mazespin_f1_team_scuderia_spinnati")
    if (!file) {
      file = files.find(f => getNormalizedFileName(f) === strategySanitized.toLowerCase());
    }

    // 3. Fallback: Nome originale con spazi (es. "piston league")
    if (!file) {
      file = files.find(f => getNormalizedFileName(f) === strategyOriginal.toLowerCase());
    }

    if (!file || !file.id) {
      console.log(`[DRIVE-API] Nessun file trovato per "${name}".`);
      // Ritorna 404 così il frontend può usare l'immagine di fallback (onError)
      return new NextResponse('Image not found', { status: 404 });
    }

    // Recupera lo stream del file da Google Drive
    const fileResponse = await drive.files.get(
      { fileId: file.id, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    // Determina il Content-Type in base al mimeType o all'estensione
    let contentType = file.mimeType || 'image/jpeg';
    if (file.name?.toLowerCase().endsWith('.png')) contentType = 'image/png';
    else if (file.name?.toLowerCase().endsWith('.webp')) contentType = 'image/webp';

    console.log(`[DRIVE-API] Trovato file: "${file.name}" (${file.id}). Invio immagine.`);

    // Restituisce l'immagine al client
    return new NextResponse(fileResponse.data as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        // Disabilita completamente la cache per questa rotta per risolvere i problemi in produzione.
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Drive API Error:', error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
