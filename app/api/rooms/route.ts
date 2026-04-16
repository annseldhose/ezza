import { ROOMS } from '@/lib/rooms';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    rooms: ROOMS,
  });
}
