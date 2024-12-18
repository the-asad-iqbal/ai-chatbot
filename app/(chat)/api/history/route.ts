import { NextRequest } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  if (!session.user.id) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  const chats = await getChatsByUserId({
    id: session.user.id,
    limit,
    page,
  });

  return Response.json(chats);
}
