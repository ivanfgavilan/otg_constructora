'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from '../app/page.module.css';
import LeadDetailModal from './LeadDetailModal';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
}

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS = [
  { id: 'Nuevo', title: 'Nuevo' },
  { id: 'Contactar', title: 'Contactar' },
  { id: 'Visita Agendada', title: 'Visita Agendada' },
  { id: 'Negociación', title: 'Negociación' }
];

export default function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Agrupar leads por status
  const getLeadsByStatus = (status: string) => leads.filter(l => l.status === status);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Actualización optimista en UI
    const updatedLeads = leads.map(l => 
      l.id === leadId ? { ...l, status: newStatus } : l
    );
    setLeads(updatedLeads);

    // Persistir en servidor
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      // Opcional: revertir en caso de error
      setLeads(initialLeads);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.board}>
          {COLUMNS.map((col) => (
            <div key={col.id} className={styles.column}>
              <h2 className={styles.columnTitle}>
                {col.title} <span className={styles.count}>{getLeadsByStatus(col.id).length}</span>
              </h2>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`${styles.columnContent} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                  >
                    {getLeadsByStatus(col.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${styles.card} ${snapshot.isDragging ? styles.dragging : ''}`}
                          >
                            <div className={styles.cardClickArea} onClick={() => setSelectedLeadId(lead.id)}>
                              <p className={styles.cardName}>{lead.firstName} {lead.lastName}</p>
                              <p className={styles.cardPhone}>{lead.phone}</p>
                              <div className={styles.cardFooter}>
                                <span>ID: {lead.id}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {getLeadsByStatus(col.id).length === 0 && !snapshot.isDraggingOver && (
                      <div className={styles.placeholder}>Sin leads</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedLeadId && (
        <LeadDetailModal 
          leadId={selectedLeadId} 
          onClose={() => setSelectedLeadId(null)} 
          onUpdate={() => {
            // Recargar datos o actualizar estado si es necesario
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
