import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import styles from './archive.module.css';
import Link from 'next/link';

import ArchiveClient from './ArchiveClient';

export default async function ArchivePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const { role, id: userId } = session.user as any;
  const whereClause: any = {};

  if (role === 'vendedor') {
    whereClause.assignedId = userId;
  }

  const archivedLeads = await prisma.lead.findMany({
    where: whereClause,
    include: {
      assignedTo: {
        select: { name: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Mapear a JSON puro para evitar problemas de hidratación con fechas
  const leadsJson = JSON.parse(JSON.stringify(archivedLeads));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="title">Listado de Leads</h1>
          <p className="subtitle">Base de datos centralizada (Activos + Historial)</p>
        </div>
      </header>

      <ArchiveClient initialLeads={leadsJson} />
    </div>
  );
}
