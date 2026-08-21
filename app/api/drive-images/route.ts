import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const TEAM_FOLDER_ID = process.env.TEAM_FOLDER_ID;
const LEAGUE_FOLDER_ID = process.env.LEAGUE_FOLDER_ID;
// Fallback to LEAGUE_FOLDER_ID if COPPA_FOLDER_ID is not set
const COPPA_FOLDER_ID = process.env.COPPA_FOLDER_ID || LEAGUE_FOLDER_ID;

console.log('[DRIVE-API-ENV] TEAM_FOLDER_ID:', TEAM_FOLDER_ID);
console.log('[DRIVE-API-ENV] LEAGUE_FOLDER_ID:', LEAGUE_FOLDER_ID);
console.log('[DRIVE-API-ENV] COPPA_FOLDER_ID:', COPPA_FOLDER_ID);

interface FileMeta {
  id: string;
  name: string;
  mimeType: string;
}

interface ImageBufferCache {
  buffer: ArrayBuffer;
  contentType: string;
  etag: string;
  timestamp: number;
}

// In-Memory Cache per la lista dei file da Google Drive (10 minuti TTL)
const fileListCache: {
  team: { files: FileMeta[]; timestamp: number } | null;
  league: { files: FileMeta[]; timestamp: number } | null;
} = { team: null, league: null };

const FILE_LIST_TTL = 10 * 60 * 1000; // 10 minuti

// In-Memory Cache per i contenuti binari delle immagini (1 ora TTL)
const imageBufferCacheMap = new Map<string, ImageBufferCache>();
const IMAGE_BUFFER_TTL = 60 * 60 * 1000; // 1 ora

const getAuth = () => {
  try {
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
    return null;
  } catch (error) {
    console.error("Google Auth initialization error:", error);
    return null;
  }
};

async function getCachedFileList(drive: any, folderId: string, type: 'team' | 'league'): Promise<FileMeta[]> {
  const now = Date.now();
  const cached = fileListCache[type];
  if (cached && (now - cached.timestamp < FILE_LIST_TTL)) {
    return cached.files;
  }

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 1000,
  });

  const files = (res.data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType
  }));

  fileListCache[type] = { files, timestamp: now };
  return files;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as 'team' | 'league';
  const name = searchParams.get('name');

  if (!type || !name) {
    return new NextResponse('Missing type or name', { status: 400 });
  }

  const folderId = type === 'team' ? TEAM_FOLDER_ID : LEAGUE_FOLDER_ID;
  if (!folderId) {
    return new NextResponse('Folder ID missing in environment variables', { status: 500 });
  }

  const auth = getAuth();
  if (!auth) {
    return new NextResponse('Auth configuration missing', { status: 500 });
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    const files = await getCachedFileList(drive, folderId, type);

    const nameTrimmed = name.trim();
    const strategySimple = nameTrimmed.replace(/\s+/g, '_');
    const strategySanitized = nameTrimmed.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const strategyOriginal = nameTrimmed;

    const getNormalizedFileName = (f: FileMeta) => {
      if (!f.name) return '';
      const fileNameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
      return fileNameWithoutExt.trim().toLowerCase();
    };

    let file = files.find(f => getNormalizedFileName(f) === strategySimple.toLowerCase());
    if (!file) {
      file = files.find(f => getNormalizedFileName(f) === strategySanitized.toLowerCase());
    }
    if (!file) {
      file = files.find(f => getNormalizedFileName(f) === strategyOriginal.toLowerCase());
    }

    if (!file || !file.id) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const etag = `W/"drive-img-${file.id}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        }
      });
    }

    const now = Date.now();
    let cachedBuffer = imageBufferCacheMap.get(file.id);
    if (!cachedBuffer || (now - cachedBuffer.timestamp > IMAGE_BUFFER_TTL)) {
      const fileResponse = await drive.files.get(
        { fileId: file.id, alt: 'media', supportsAllDrives: true },
        { responseType: 'arraybuffer' }
      );

      let contentType = file.mimeType || 'image/jpeg';
      if (file.name?.toLowerCase().endsWith('.png')) contentType = 'image/png';
      else if (file.name?.toLowerCase().endsWith('.webp')) contentType = 'image/webp';

      cachedBuffer = {
        buffer: fileResponse.data as ArrayBuffer,
        contentType,
        etag,
        timestamp: now
      };
      imageBufferCacheMap.set(file.id, cachedBuffer);
    }

    return new NextResponse(cachedBuffer.buffer, {
      headers: {
        'Content-Type': cachedBuffer.contentType,
        'ETag': etag,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });

  } catch (error: any) {
    console.error('Drive API Error:', error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
