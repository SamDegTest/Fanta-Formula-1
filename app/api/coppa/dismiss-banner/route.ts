import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    try {
        const { cupId } = await request.json();

        if (!cupId) {
            return NextResponse.json({ error: 'L\'ID della coppa è obbligatorio.' }, { status: 400 });
        }

        const cup: any = await kv.get(cupId);

        if (!cup) {
            return NextResponse.json({ error: 'Coppa non trovata.' }, { status: 404 });
        }

        if (cup.dateChangeInfo) {
            cup.dateChangeInfo.showDateChangeBanner = false;
            await kv.set(cupId, cup);
        }

        return NextResponse.json({ message: 'Banner nascosto con successo.' }, { status: 200 });

    } catch (error) {
        console.error("Errore nel nascondere il banner:", error);
        return NextResponse.json({ error: 'Si è verificato un errore interno. Riprova più tardi.' }, { status: 500 });
    }
}
