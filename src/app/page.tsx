export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import styles from './page.module.css';
import NewLeadButton from '@/components/NewLeadButton';
import KanbanBoard from '@/components/KanbanBoard';

export default async function Home() {
  // Obtener leads de la base de datos
  const leads = await prisma.lead.findMany({
    where: {
      status: {
        notIn: ['Pausa', 'Vendido', 'Descartado']
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pipeline de Ventas</h1>
          <p className={styles.subtitle}>Gestiona y trackea tus leads de OTG Constructora</p>
        </div>
        <NewLeadButton />
      </header>

      <KanbanBoard initialLeads={JSON.parse(JSON.stringify(leads))} />
    </div>
  );
}
