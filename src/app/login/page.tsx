'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Credenciales inválidas');
    } else {
      // Forzamos el redireccionamiento al home
      // window.location es más seguro en producción para que el Middleware se entere
      window.location.replace('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          {/* Cambiamos Image por img normal para evitar errores de optimización en el servidor */}
         <img 
              src="https://i.imgur.com/k6txwaO.png" 
              alt="OTG Constructora" 
              style={{ width: '180px', height: 'auto' }}
            />
        </div>
        
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <p className={styles.subtitle}>Ingresa tus credenciales para acceder al CRM</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email"
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-primary">Entrar al Sistema</button>
        </form>
      </div>
    </div>
  );
}
