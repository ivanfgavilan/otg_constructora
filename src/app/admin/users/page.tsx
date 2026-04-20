'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserCircle, Trash2 } from 'lucide-react';
import styles from './users.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, email: user.email, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
      const method = editingUserId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Error en la operación');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vendedor? Los leads asignados quedarán sin asignar.')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (session && (session.user as any).role !== 'admin') {
    return <div className={styles.unauthorized}>No tienes permisos para acceder a esta sección.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="title">Gestión de Vendedores</h1>
          <p className="subtitle">Administra los accesos y roles del equipo de ventas</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Nuevo Vendedor
        </button>
      </header>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userName}>
                      <UserCircle size={20} className={styles.userIcon} />
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <button className={styles.editBtn} onClick={() => handleOpenEdit(user)}>
                        <UserPlus size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.empty}>No hay vendedores registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingUserId ? 'Editar Vendedor' : 'Nuevo Vendedor'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre Completo</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Carlos Rodriguez"
                />
              </div>
              <div className={styles.field}>
                <label>Correo Electrónico</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendedor@otg.com"
                />
              </div>
              <div className={styles.field}>
                <label>{editingUserId ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}</label>
                <input 
                  type="password"
                  required={!editingUserId}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                />
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingUserId ? 'Guardar Cambios' : 'Crear Vendedor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
