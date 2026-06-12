import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

// Force the route to be dynamic to prevent Next.js from freezing it (Static Generation)
export const dynamic = 'force-dynamic';

const TEAM_FOLDER_ID = process.env.TEAM_FOLDER_ID;
const LEAGUE_FOLDER_ID = process.env.LEAGUE_FOLDER_ID;
// Fallback to LEAGUE_FOLDER_ID if COPPA_FOLDER_ID is not set
const COPPA_FOLDER_ID = process.env.COPPA_FOLDER_ID || LEAGUE_FOLDER_ID;

console.log('[DRIVE-API-ENV] TEAM_FOLDER_ID:', TEAM_FOLDER_ID);
console.log('[DRIVE-API-ENV] LEAGUE_FOLDER_ID:', LEAGUE_FOLDER_ID);
console.log('[DRIVE-API-ENV] COPPA_FOLDER_ID:', COPPA_FOLDER_ID);

// Initialize Google authentication
const getAuth = () => {
  try {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      let jsonContent = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim();
      
      if ((jsonContent.startsWith("'") && jsonContent.endsWith("'")) || 
          (jsonContent.startsWith('"') && jsonContent.endsWith('"'))) {
        jsonContent = jsonContent.slice(1, -1);
      }

      let credentials;
      try {
        credentials = JSON.parse(jsonContent);
      } catch (e) {
        console.error("Error parsing credentials JSON. Attempting to clean up...", e);
        const sanitized = jsonContent.replace(/\\n/g, '\n');
        credentials = JSON.parse(sanitized);
      }

      return new google.auth.GoogleAuth({
        credentials,
        scopes,
      });
    }

    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      return new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes,
      });
    }
    
    console.error("CRITICAL ERROR: Google Drive credentials missing (GOOGLE_APPLICATION_CREDENTIALS_JSON).");
    return null;
  } catch (error) {
    console.error("Google Auth initialization error:", error);
    return null;
  }
};


export async function POST(request: NextRequest) {
    const auth = getAuth();
    if (!auth) {
        return new NextResponse('Auth configuration missing', { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const type = formData.get('type') as 'team' | 'league' | 'cup';

        if (!file || !name || !type) {
            return new NextResponse('Missing file, name, or type', { status: 400 });
        }

        let folderId: string | undefined;
        switch (type) {
            case 'team':
                folderId = TEAM_FOLDER_ID;
                break;
            case 'league':
                folderId = LEAGUE_FOLDER_ID;
                break;
            case 'cup':
                folderId = COPPA_FOLDER_ID;
                break;
            default:
                return new NextResponse('Invalid type', { status: 400 });
        }

        if (!folderId) {
            return new NextResponse(`Folder ID for type "${type}" is not configured.`, { status: 500 });
        }
        
        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: `${name.replace(/\s+/g, '_')}_${new Date().getTime()}.${file.name.split('.').pop()}`,
            parents: [folderId],
        };

        const media = {
            mimeType: file.type,
            body: Readable.from(Buffer.from(await file.arrayBuffer())),
        };

        const driveResponse = await drive.files.create({
            //@ts-ignore
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
            supportsAllDrives: true,
        });

        const fileId = driveResponse.data.id;

        if (!fileId) {
            throw new Error('File ID not returned from Drive API');
        }

        // Make the file publicly readable
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        return NextResponse.json({ fileId });

    } catch (error: any) {
        console.error('Drive API Error (POST):', error.message);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'team' | 'league' | 'cup';
  const name = searchParams.get('name');

  if (!type || !name) {
    return new NextResponse('Missing type or name', { status: 400 });
  }

  let folderId: string | undefined;
  switch (type) {
      case 'team':
          folderId = TEAM_FOLDER_ID;
          break;
      case 'league':
          folderId = LEAGUE_FOLDER_ID;
          break;
      case 'cup':
          folderId = COPPA_FOLDER_ID;
          break;
      default:
        // This should not be reached if type is validated, but as a safeguard:
        return new NextResponse('Invalid type specified', { status: 400 });
  }
  
  if (!folderId) {
      console.error(`[DRIVE-API-ERROR] Folder ID for type "${type}" is not configured.`);
      return new NextResponse(`Folder ID for type "${type}" is not configured.`, { status: 500 });
  }

  const auth = getAuth();
  if (!auth) {
    return new NextResponse('Auth configuration missing', { status: 500 });
  }
  console.log(`[DRIVE-API] Request: Type=${type}, Name="${name}", FolderID=${folderId}`);

  try {
    const drive = google.drive({ version: 'v3', auth });
    
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
    });

    const files = res.data.files || [];
    
    const nameTrimmed = name.trim().toLowerCase();
    
    const searchStrategies = [
        // Strategy 1: Simple replacement of spaces with underscores (e.g., "cricchetto cup background" -> "cricchetto_cup_background")
        nameTrimmed.replace(/\s+/g, '_'),
        // Strategy 2: Full sanitization (e.g., "Cricchetto Cup & Background!" -> "cricchetto_cup_background")
        nameTrimmed.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_'),
        // Strategy 3: Original name (e.g., "cricchetto cup background")
        nameTrimmed
    ];

    console.log(`[DRIVE-API] Searching for matches for: "${nameTrimmed}" using strategies:`, searchStrategies);

    const getNormalizedFileName = (f: any) => {
      if (!f.name) return '';
      const fileNameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
      return fileNameWithoutExt.trim().toLowerCase();
    };
    
    let file = null;

    for (const strategy of searchStrategies) {
        const foundFile = files.find(f => getNormalizedFileName(f) === strategy);
        if (foundFile) {
            file = foundFile;
            console.log(`[DRIVE-API] Match found with strategy "${strategy}": File "${file.name}"`);
            break;
        }
    }

    if (!file || !file.id) {
      console.log(`[DRIVE-API] No file found for "${name}".`);
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileResponse = await drive.files.get(
      { fileId: file.id, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    let contentType = file.mimeType || 'image/jpeg';
    if (file.name?.toLowerCase().endsWith('.png')) contentType = 'image/png';
    else if (file.name?.toLowerCase().endsWith('.webp')) contentType = 'image/webp';

    console.log(`[DRIVE-API] Found file: "${file.name}" (${file.id}). Sending image.`);

    return new NextResponse(fileResponse.data as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
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
