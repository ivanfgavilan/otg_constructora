'use client';

import { useState, useEffect } from 'react';
import styles from './TaskModal.module.css';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
}

interface TaskModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskModal({ onClose, onUpdate }: TaskModalProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    dueTime: '',
    leadId: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Nueva Tarea</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Título de la Tarea</label>
            <input 
              required
              placeholder="Ej: Llamar para confirmar visita"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Fecha</label>
              <input 
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Hora</label>
              <input 
                type="time"
                required
                value={formData.dueTime}
                onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Asignar Lead</label>
            <select 
              required
              value={formData.leadId}
              onChange={e => setFormData({ ...formData, leadId: e.target.value })}
            >
              <option value="">Selecciona un lead...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving || loading}>
              {saving ? 'Guardando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
