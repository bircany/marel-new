import { NextResponse } from 'next/server';
import { getSettingsFromDb } from '@/db';

export async function GET() {
  try {
    const settings = await getSettingsFromDb();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar okunamadı' }, { status: 500 });
  }
}
