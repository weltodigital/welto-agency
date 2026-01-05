import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check access rights
    if (user.role !== 'admin' && user.client_id !== params.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period');

    const searchQueries = await db.getAllSearchQueries(params.id, period || undefined);

    return NextResponse.json(searchQueries);
  } catch (error) {
    console.error('Search queries error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}