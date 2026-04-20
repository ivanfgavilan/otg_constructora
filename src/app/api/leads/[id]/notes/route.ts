import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const leadId = parseInt(idStr);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newNote = await prisma.note.create({
      data: {
        content,
        leadId,
        authorId: (session.user as any).id
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Error creating note' }, { status: 500 });
  }
}
