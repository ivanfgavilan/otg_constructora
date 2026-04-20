'use client';

import { useState } from 'react';
import styles from './NewLead.module.css';

export default function NewLeadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      documentType: formData.get('documentType'),
      document: formData.get('document'),
      city: formData.get('city'),
      country: formData.get('country'),
      status: 'Nuevo'
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsOpen(false);
        window.location.reload(); // Recargar para ver el cambio
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        + Nuevo Lead
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Nuevo Lead</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <input name="firstName" placeholder="Nombre" required />
                <input name="lastName" placeholder="Apellido" required />
                <input name="phone" placeholder="Teléfono" required />
                
                <select name="documentType">
                  <option value="">Tipo de Documento</option>
                  <option value="DNI">DNI / Cédula</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="RUT">RUT / NIT</option>
                </select>
                
                <input name="document" placeholder="Número de Documento" />
                <input name="city" placeholder="Ciudad" />
                <input name="country" placeholder="País" />
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
