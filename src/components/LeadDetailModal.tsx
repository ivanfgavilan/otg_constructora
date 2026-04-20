'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './LeadDetail.module.css';

interface Note {
  id: number;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

interface User {
  id: number;
  name: string;
}

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  assignedId?: number;
  documentType?: string;
  document?: string;
  city?: string;
  country?: string;
  notes: Note[];
}

interface LeadDetailModalProps {
  leadId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function LeadDetailModal({ leadId, onClose, onUpdate }: LeadDetailModalProps) {
  const { data: session } = useSession();
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    fetchLead();
    if (isAdmin) {
      fetchUsers();
    }
  }, [leadId, isAdmin]);

  const fetchLead = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        setEditData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          documentType: data.documentType,
          document: data.document,
          city: data.city,
          country: data.country
        });
      } else {
        setError('No se pudo cargar la información del lead.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setUpdatingInfo(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchLead();
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingInfo(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingInfo(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchLead();
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleAssign = async (userId: string) => {
    setUpdatingInfo(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedId: userId || null })
      });
      if (res.ok) {
        fetchLead();
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      });

      if (res.ok) {
        setNewNote('');
        fetchLead(); // Refrescar notas
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'Pausa') return 'Stand by';
    return status;
  };

  if (loading) return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <p className={styles.loadingText}>Cargando detalles...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={onClose} className="btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  );

  if (!lead) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {isEditing ? (
              <div className={styles.editNameRow}>
                <input 
                  value={editData.firstName} 
                  onChange={e => setEditData({...editData, firstName: e.target.value})}
                  className={styles.editInput}
                />
                <input 
                  value={editData.lastName} 
                  onChange={e => setEditData({...editData, lastName: e.target.value})}
                  className={styles.editInput}
                />
              </div>
            ) : (
              <h2 className={styles.title}>{lead.firstName} {lead.lastName}</h2>
            )}
            <span className={styles.statusBadge}>{getStatusLabel(lead.status)}</span>
          </div>
          <div className={styles.headerActions}>
            {isEditing ? (
              <button 
                className="btn-primary" 
                onClick={handleSaveEdit}
                disabled={updatingInfo}
              >Guardar</button>
            ) : (
              <button 
                className={styles.editBtn} 
                onClick={() => setIsEditing(true)}
              >Editar Datos</button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.topActions}>
            <div className={styles.actionGroup}>
              <span className={styles.actionLabel}>Acciones de Archivo:</span>
              <div className={styles.btnRow}>
                <button 
                  className={styles.archiveBtn} 
                  onClick={() => handleUpdateStatus('Vendido')}
                  disabled={updatingInfo}
                >Venta</button>
                <button 
                  className={styles.archiveBtn} 
                  onClick={() => handleUpdateStatus('Pausa')}
                  disabled={updatingInfo}
                >Stand by</button>
                <button 
                  className={styles.archiveBtn} 
                  onClick={() => handleUpdateStatus('Descartado')}
                  disabled={updatingInfo}
                >Descartar</button>
              </div>
            </div>

            {isAdmin && (
              <div className={styles.actionGroup}>
                <span className={styles.actionLabel}>Asignar a Vendedor:</span>
                <select 
                  className={styles.assignSelect}
                  value={lead.assignedId || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={updatingInfo}
                >
                  <option value="">Sin asignar</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <section className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Información del Lead</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Teléfono</span>
                {isEditing ? (
                  <input 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.value}>{lead.phone}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Documento</span>
                {isEditing ? (
                  <div className={styles.editDocRow}>
                    <select 
                      value={editData.documentType} 
                      onChange={e => setEditData({...editData, documentType: e.target.value})}
                      className={styles.editSelect}
                    >
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="NIT">NIT</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                    <input 
                      value={editData.document} 
                      onChange={e => setEditData({...editData, document: e.target.value})}
                      className={styles.editInput}
                    />
                  </div>
                ) : (
                  <span className={styles.value}>
                    {lead.documentType && lead.document ? `${lead.documentType}: ${lead.document}` : 'No registrado'}
                  </span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Ciudad</span>
                {isEditing ? (
                  <input 
                    value={editData.city} 
                    onChange={e => setEditData({...editData, city: e.target.value})}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.value}>{lead.city || 'No registrada'}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>País</span>
                {isEditing ? (
                  <input 
                    value={editData.country} 
                    onChange={e => setEditData({...editData, country: e.target.value})}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.value}>{lead.country || 'No registrado'}</span>
                )}
              </div>
            </div>
          </section>

          <section className={styles.notesSection}>
            <h3 className={styles.sectionTitle}>Notas / Historial</h3>
            
            <form onSubmit={handleAddNote} className={styles.noteForm}>
              <textarea 
                placeholder="Añadir una nota interna..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={savingNote}>
                {savingNote ? 'Guardando...' : 'Añadir Nota'}
              </button>
            </form>

            <div className={styles.notesList}>
              {lead.notes.length === 0 ? (
                <p className={styles.emptyNotes}>No hay notas registradas para este lead.</p>
              ) : (
                lead.notes.map(note => (
                  <div key={note.id} className={styles.noteCard}>
                    <div className={styles.noteHeader}>
                      <span className={styles.noteAuthor}>{note.author.name}</span>
                      <span className={styles.noteDate}>
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={styles.noteContent}>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
