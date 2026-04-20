import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, dueDate, dueTime, leadId } = body;

    if (!title || !dueDate || !dueTime || !leadId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        dueTime,
        leadId: parseInt(leadId),
        userId: (session.user as any).id
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const { role, id: userId } = session.user as any;
    
    const whereClause: any = role === 'vendedor' ? {
      OR: [
        { userId: userId },
        { lead: { assignedId: userId } }
      ]
    } : {};

    if (status === 'pending') {
      whereClause.completed = false;
      
      // Opcional: Filtrar solo tareas de HOY o ANTES para notificaciones
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      whereClause.dueDate = {
        lte: today
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { dueTime: 'asc' }
      ]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
  }
}
