import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, status, documentType, document, city, country } = body;

    const newLead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        phone,
        status: status || 'Nuevo',
        documentType,
        document,
        city,
        country
      }
    });

    return NextResponse.json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Error creating lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    
    // Si es vendedor, solo ve sus leads. Si es admin, ve todos.
    const whereClause = role === 'vendedor' ? { assignedId: userId } : {};

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Error fetching leads' }, { status: 500 });
  }
}
