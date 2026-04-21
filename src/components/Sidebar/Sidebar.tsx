'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Users, Archive, CheckSquare, LogOut, Bell, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  // 1. PRIMERO: Declaramos todos los Hooks (Siempre arriba, siempre en el mismo orden)
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Definimos la función de carga con useCallback para que no cambie en cada render
  const fetchPendingTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch('/api/tasks?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Falla en el fetch de tareas:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchPendingTasks();
    }
  }, [session, fetchPendingTasks]);

  // 2. SEGUNDO: Condiciones de salida (Early returns)
  // Ahora que todos los hooks se ejecutaron, podemos decidir si mostrar algo o no
  if (status === "loading") {
    return <aside className={styles.sidebar}><p className={styles.emptyMsg}>Cargando...</p></aside>;
  }

  if (pathname === '/login' || !session) {
    return null;
  }

  // 3. TERCERO: El renderizado final
  const isActive = (path: string) => pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        {/* Usamos el logo de Imgur que me pasaste */}
        <img
          src="https://i.imgur.com/k6txwaO.png" 
          alt="OTG Constructora"
          style={{ width: '140px', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
        />
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <p className={styles.navLabel}>Ventas</p>
          <Link href="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
            <LayoutDashboard size={20} />
            <span>Pipeline</span>
          </Link>
          <Link href="/archive" className={`${styles.navItem} ${isActive('/archive') ? styles.active : ''}`}>
            <Archive size={20} />
            <span>Leads</span>
          </Link>
        </div>

        <div className={styles.navGroup}>
          <p className={styles.navLabel}>Gestión</p>
          <Link href="/tasks" className={`${styles.navItem} ${isActive('/tasks') ? styles.active : ''}`}>
            <CheckSquare size={20} />
            <span>Tareas</span>
          </Link>
          <Link href="/admin/users" className={`${styles.navItem} ${isActive('/admin/users') ? styles.active : ''}`}>
            <Users size={20} />
            <span>Vendedores</span>
          </Link>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.notificationWrapper}>
          <button 
            className={`${styles.iconBtn} ${pendingTasks.length > 0 ? styles.hasNotifications : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} />
            {pendingTasks.length > 0 && <span className={styles.badge}>{pendingTasks.length}</span>}
          </button>

          {showNotifications && (
            <div className={styles.notificationMenu}>
              <div className={styles.menuHeader}>
                <h3>Tareas Pendientes</h3>
                <button onClick={() => setShowNotifications(false)}>×</button>
              </div>
              <div className={styles.taskList}>
                {loadingTasks ? (
                  <p className={styles.emptyMsg}>Cargando...</p>
                ) : pendingTasks.length === 0 ? (
                  <p className={styles.emptyMsg}>No tienes tareas para hoy 🎉</p>
                ) : (
                  pendingTasks.slice(0, 5).map(task => (
                    <div key={task.id} className={styles.taskItem}>
                      <div className={styles.taskInfo}>
                        <p className={styles.taskTitle}>{task.title}</p>
                        <p className={styles.taskSubtitle}>{task.lead?.firstName || 'Lead'} • {task.dueTime || 'Hoy'}</p>
                      </div>
                      <button 
                        className={styles.doneBtn}
                        onClick={() => handleMarkAsDone(task.id)}
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <Link href="/tasks" className={styles.viewAllBtn} onClick={() => setShowNotifications(false)}>
                Ver todas las tareas
              </Link>
            </div>
          )}
        </div>

        <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

// Función auxiliar para el botón de completar (fuera del componente para evitar recrearla)
async function handleMarkAsDone(id: number) {
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });
    window.location.reload(); // Recarga simple para actualizar la lista
  } catch (err) {
    console.error(err);
  }
}
