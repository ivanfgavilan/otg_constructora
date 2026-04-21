import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, status, documentType, document, city, country } = body;
    console.log(`[API/leads] POST - Creando lead: ${firstName} ${lastName}`);

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

    console.log(`[API/leads] Lead creado con ID: ${newLead.id}`);
    return NextResponse.json(newLead);
  } catch (error) {
    console.error('[API/leads] Error al crear lead:', error);
    return NextResponse.json({ error: 'Error creating lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn('[API/leads] GET - Sin sesión, rechazado');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    console.log(`[API/leads] GET - Usuario: ${(session.user as any).email} | Rol: ${role}`);
    
    const whereClause = role === 'vendedor' ? { assignedId: userId } : {};

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[API/leads] GET - Devolviendo ${leads.length} leads`);
    return NextResponse.json(leads);
  } catch (error) {
    console.error('[API/leads] Error al obtener leads:', error);
    return NextResponse.json({ error: 'Error fetching leads' }, { status: 500 });
  }
}
