import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user_guid, nickname, logo } = await request.json();

    if (!user_guid) {
      return NextResponse.json({ error: 'user_guid è obbligatorio.' }, { status: 400 });
    }
    if (!nickname || typeof nickname !== 'string') {
        return NextResponse.json({ error: 'Il soprannome è obbligatorio.' }, { status: 400 });
    }

    const userId = `user:${user_guid}`;

    const userData = {
      nickname,
      logo, // Può essere un URL o un identificatore per l'immagine
    };

    await kv.set(userId, userData);

    return NextResponse.json({ message: 'Dati utente salvati con successo!', user: userData }, { status: 201 });

  } catch (error) {
    console.error("Errore nel salvataggio dei dati utente:", error);
    return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user_guid = searchParams.get('user_guid');

        if (!user_guid) {
            return NextResponse.json({ error: 'Il parametro user_guid è obbligatorio.' }, { status: 400 });
        }

        const userId = `user:${user_guid}`;
        const userData = await kv.get(userId);

        if (!userData) {
            return NextResponse.json({ error: 'Utente non trovato.' }, { status: 404 });
        }

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error("Errore nel recupero dei dati utente:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}
