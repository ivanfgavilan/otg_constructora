import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          include: {
            author: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        tasks: true
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Error fetching lead' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { status, assignedId, firstName, lastName, phone, city, country, documentType, document } = body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (assignedId !== undefined) data.assignedId = assignedId ? parseInt(assignedId) : null;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (city !== undefined) data.city = city;
    if (country !== undefined) data.country = country;
    if (documentType !== undefined) data.documentType = documentType;
    if (document !== undefined) data.document = document;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Error updating lead' }, { status: 500 });
  }
}
