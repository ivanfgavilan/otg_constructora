'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import TaskModal from '@/components/TaskModal';
import styles from './tasks.module.css';

interface Task {
  id: number;
  title: string;
  dueDate: string;
  dueTime: string;
  completed: boolean;
  lead: {
    firstName: string;
    lastName: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="title">Panel de Tareas</h1>
          <p className="subtitle">Gestión global de actividades y recordatorios</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Nueva Tarea
        </button>
      </header>
      
      {loading ? (
        <p>Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <div className={styles.emptyState}>
          No tienes tareas programadas. ¡Crea una para empezar!
        </div>
      ) : (
        <div className={styles.tasksList}>
          {tasks.map(task => (
            <div key={task.id} className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}>
              <div className={styles.taskCheck}>
                <button 
                  className={`${styles.checkBtn} ${task.completed ? styles.checked : ''}`}
                  onClick={() => toggleComplete(task)}
                >
                  <CheckCircle size={24} />
                </button>
              </div>
              <div className={styles.taskInfo}>
                <h3 className={styles.taskTitle}>{task.title}</h3>
                <div className={styles.taskMeta}>
                  <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                  <span>⏰ {task.dueTime}</span>
                  <span className={styles.leadBadge}>
                    👤 {task.lead.firstName} {task.lead.lastName}
                  </span>
                </div>
              </div>
              <div className={styles.taskActions}>
                <button className={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
                   Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TaskModal 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
}
