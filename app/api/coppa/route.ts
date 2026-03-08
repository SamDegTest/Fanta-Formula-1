import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cupName, participants, settings } = await request.json();

    // --- Validazione Semplice ---
    if (!cupName || typeof cupName !== 'string' || cupName.length < 3) {
      return NextResponse.json({ error: 'Il nome della coppa deve essere di almeno 3 caratteri.' }, { status: 400 });
    }
     if (!participants || !Array.isArray(participants) || participants.length < 4) {
      return NextResponse.json({ error: 'Sono richiesti almeno 4 partecipanti.' }, { status: 400 });
    }

    const id = cupName.toLowerCase().replace(/\s+/g, '-');
    const cupId = `cup:${id}`;

    // Controlla se una coppa con lo stesso ID esiste già
    const existingCup = await kv.get(cupId);
    if (existingCup) {
        return NextResponse.json({ error: 'Una coppa con questo nome esiste già.' }, { status: 409 });
    }

    const newCup = {
      id: cupId,
      name: cupName,
      creationDate: new Date().toISOString(),
      imageUrl: `/api/drive-images?type=cup&name=${cupName}`,
      settings: settings,
      participants: participants || [],
      matches: [],
      status: 'pending' // 'pending', 'active', 'completed'
    };

    await kv.set(cupId, newCup);

    return NextResponse.json({ message: 'Coppa creata con successo!', cup: newCup }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione della coppa:', error);
    return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const cupId = `cup:${id}`;
            const cup = await kv.get(cupId);

            if (!cup) {
                return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
            }
            return NextResponse.json(cup, { status: 200 });
        } else {
            const cupIds = await kv.keys('cup:*');
            if (cupIds.length === 0) {
                return NextResponse.json([], { status: 200 });
            }
            const cups = await kv.mget(...cupIds);
            return NextResponse.json(cups, { status: 200 });
        }

    } catch (error) {
        console.error("Errore nel recupero delle coppe:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, participants, matches, status } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'L\'ID della coppa è obbligatorio per l\'aggiornamento.' }, { status: 400 });
        }

        const cupId = `cup:${id}`;
        const cup: any = await kv.get(cupId);

        if (!cup) {
            return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
        }

        // Aggiorna i campi forniti
        if (participants) {
            cup.participants = participants;
        }
        if (matches) {
            cup.matches = matches;
        }
        if (status) {
            cup.status = status;
        }

        await kv.set(cupId, cup);

        return NextResponse.json({ message: 'Coppa aggiornata con successo!', cup }, { status: 200 });

    } catch (error) {
        console.error("Errore nell'aggiornamento della coppa:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id, adminPassword } = await request.json();
        
        if (adminPassword !== 'soloiopossofarlo') {
            return NextResponse.json({ error: 'Password di amministrazione non corretta.' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'L\'ID della coppa è obbligatorio per l\'eliminazione.' }, { status: 400 });
        }

        const cupId = `cup:${id}`;
        const cup: any = await kv.get(cupId);

        if (!cup) {
            return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
        }

        await kv.del(cupId);

        return NextResponse.json({ message: 'Coppa eliminata con successo!' }, { status: 200 });

    } catch (error) {
        console.error("Errore nell'eliminazione della coppa:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}
