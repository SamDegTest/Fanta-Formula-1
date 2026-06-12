import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const response = await fetch(`https://api.openf1.org/v1/sessions?session_type=Race&year=${currentYear}`);
    if (!response.ok) {
      throw new Error('Failed to fetch calendar data from OpenF1');
    }
    const data = await response.json();
    const futureRaces = data.filter((race: any) => new Date(race.date_start) > new Date());
    futureRaces.sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    return NextResponse.json(futureRaces);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
