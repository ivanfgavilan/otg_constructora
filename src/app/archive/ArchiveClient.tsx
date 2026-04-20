'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import LeadDetailModal from '@/components/LeadDetailModal';
import styles from './archive.module.css';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  city?: string;
  country?: string;
  updatedAt: string;
  assignedTo?: {
    name: string;
  };
}

interface ArchiveClientProps {
  initialLeads: Lead[];
}

export default function ArchiveClient({ initialLeads = [] }: ArchiveClientProps) {
  const [filter, setFilter] = useState<'all' | 'Pausa' | 'Vendido' | 'Descartado' | 'Activos'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const itemsPerPage = 30;

  const PIPELINE_STATUSES = ['Nuevo', 'Contactar', 'Visita Agendada', 'Negociación'];

  const filteredAndSortedLeads = useMemo(() => {
    if (!initialLeads) return [];
    return initialLeads
      .filter(lead => {
        if (!lead) return false;
        let matchesFilter = true;
        if (filter === 'all') matchesFilter = true;
        else if (filter === 'Activos') matchesFilter = PIPELINE_STATUSES.includes(lead.status);
        else matchesFilter = lead.status === filter;

        const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
        const matchesSearch = 
          fullName.includes(searchTerm.toLowerCase()) || 
          (lead.phone || '').includes(searchTerm) ||
          (lead.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.country || '').toLowerCase().includes(searchTerm.toLowerCase());
          
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [initialLeads, filter, sortOrder, searchTerm]);

  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const paginatedLeads = filteredAndSortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusLabel = (status: string) => {
    if (status === 'Pausa') return 'Stand by';
    if (status === 'Vendido') return 'Venta';
    if (status === 'Descartado') return 'Descartado';
    return status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Vendido') return styles.sold;
    if (status === 'Pausa') return styles.standby;
    if (status === 'Descartado') return styles.discarded;
    return styles.activeBadge;
  };

  return (
    <div className={styles.archiveWrapper}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o ubicación..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select value={filter} onChange={(e) => {
              setFilter(e.target.value as any);
              setCurrentPage(1);
            }}>
              <option value="all">Filtro: Todo el Universo</option>
              <option value="Activos">En Pipeline (Activos)</option>
              <option value="Vendido">Ventas Cerradas</option>
              <option value="Pausa">En Stand by</option>
              <option value="Descartado">Descartados</option>
            </select>
          </div>

          <button 
            className={styles.sortBtn}
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            Orden por Fecha {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Teléfono</th>
              <th>Estado Actual</th>
              <th>Ubicación</th>
              <th>Vendedor</th>
              <th>Última Actividad</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map(lead => (
              <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={styles.clickableRow}>
                <td className={styles.bold}>{lead.firstName} {lead.lastName}</td>
                <td>{lead.phone}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </td>
                <td>{lead.city || lead.country ? `${lead.city || ''}${lead.city && lead.country ? ', ' : ''}${lead.country || ''}` : '-'}</td>
                <td>{lead.assignedTo?.name || 'Sin asignar'}</td>
                <td>{lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>No se encontraron resultados para los filtros seleccionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className={styles.pageBtn}
          >Anterior</button>
          
          <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className={styles.pageBtn}
          >Siguiente</button>
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailModal 
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={() => {
            // Aquí se podría recargar la data si fuera necesario, 
            // pero para esta vista inicial de búsqueda rápida, 
            // el usuario puede refrescar si necesita ver el cambio reflejado inmediatamente.
            // O podríamos redirigir. Por ahora solo cerramos.
          }}
        />
      )}
    </div>
  );
}
