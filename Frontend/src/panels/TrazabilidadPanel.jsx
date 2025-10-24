// TrazabilidadPanel.jsx - Sistema de Trazabilidad
import React, { useState } from 'react';
import { apiFacade } from '../apiFacade';

export function TrazabilidadPanel() {
  const [busqueda, setBusqueda] = useState({ tipo: 'lote', valor: '' });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 4000);
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.valor.trim()) {
      mostrarMensaje('Por favor ingrese un valor de búsqueda', 'error');
      return;
    }

    try {
      setLoading(true);
      setResultado(null);
      
      let data;
      if (busqueda.tipo === 'lote') {
        data = await apiFacade.trazabilidad.porLote(busqueda.valor);
      } else {
        data = await apiFacade.trazabilidad.porOP(busqueda.valor);
      }
      
      setResultado(data);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        mostrarMensaje('No se encontraron resultados', 'error');
      }
    } catch (err) {
      mostrarMensaje(err.message || 'Error al buscar', 'error');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = () => {
    if (!resultado) return null;

    const eventos = [];
    
    // Si es búsqueda por lote
    if (busqueda.tipo === 'lote' && resultado.recepcion) {
      eventos.push({
        etapa: 'Recepción',
        fecha: resultado.recepcion.fechaRecepcion,
        icon: '📦',
        color: '#3498db',
        detalles: [
          `OC: ${resultado.recepcion.ordenCompra?.numero || 'N/A'}`,
          `Proveedor: ${resultado.recepcion.ordenCompra?.proveedor?.nombre || 'N/A'}`,
          `Cantidad: ${resultado.recepcion.lotes?.reduce((sum, l) => sum + l.cantidad, 0) || 0} kg`
        ]
      });
    }

    // QC Recepción
    if (resultado.qcRecepciones && resultado.qcRecepciones.length > 0) {
      resultado.qcRecepciones.forEach(qc => {
        eventos.push({
          etapa: 'Control de Calidad',
          fecha: qc.fecha,
          icon: '🔍',
          color: qc.resultado === 'aprobado' ? '#27ae60' : '#e74c3c',
          detalles: [
            `Resultado: ${qc.resultado?.toUpperCase()}`,
            `Humedad: ${qc.mediciones?.humedad || 'N/A'}%`,
            `Acidez: ${qc.mediciones?.acidez || 'N/A'}`,
            qc.notas && `Notas: ${qc.notas}`
          ].filter(Boolean)
        });
      });
    }

    // Producción
    if (resultado.ordenesProduccion && resultado.ordenesProduccion.length > 0) {
      resultado.ordenesProduccion.forEach(op => {
        eventos.push({
          etapa: 'Producción',
          fecha: op.createdAt,
          icon: '🏭',
          color: '#f39c12',
          detalles: [
            `Código OP: ${op.codigo}`,
            `Producto: ${op.producto}`,
            `Cantidad: ${op.cantidadTotal || 0} kg`,
            `Estado: ${op.estado || 'N/A'}`
          ]
        });
      });
    }

    // QC Proceso
    if (resultado.qcProceso && resultado.qcProceso.length > 0) {
      resultado.qcProceso.forEach(qc => {
        eventos.push({
          etapa: 'QC Proceso',
          fecha: qc.createdAt,
          icon: '✅',
          color: qc.resultado === 'aprobado' ? '#27ae60' : '#e74c3c',
          detalles: [
            `Etapa: ${qc.etapa}`,
            `Resultado: ${qc.resultado?.toUpperCase()}`,
            qc.checklist && `Checks: ${qc.checklist.filter(c => c.ok).length}/${qc.checklist.length} OK`
          ].filter(Boolean)
        });
      });
    }

    // Pedidos
    if (resultado.pedidos && resultado.pedidos.length > 0) {
      resultado.pedidos.forEach(ped => {
        eventos.push({
          etapa: 'Pedido',
          fecha: ped.createdAt,
          icon: '🛒',
          color: '#9b59b6',
          detalles: [
            `Código: ${ped.codigo}`,
            `Cliente: ${ped.cliente?.nombre || 'N/A'}`,
            `Estado: ${ped.estado}`
          ]
        });
      });
    }

    // Ordenar por fecha
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return (
      <div style={{ position: 'relative', padding: '2rem 0' }}>
        {/* Línea vertical del timeline */}
        <div style={{
          position: 'absolute',
          left: '30px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'linear-gradient(to bottom, #ddd 0%, #ddd 100%)'
        }} />

        {eventos.map((evento, index) => (
          <div key={index} style={{ 
            marginBottom: '2rem', 
            paddingLeft: '70px',
            position: 'relative'
          }}>
            {/* Icono del evento */}
            <div style={{
              position: 'absolute',
              left: '10px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: evento.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '3px solid white'
            }}>
              {evento.icon}
            </div>

            {/* Contenido del evento */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${evento.color}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                alignItems: 'center'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: evento.color,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  {evento.etapa}
                </h3>
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: '#7f8c8d',
                  fontWeight: 500
                }}>
                  {new Date(evento.fecha).toLocaleString()}
                </span>
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#2c3e50',
                lineHeight: '1.6'
              }}>
                {evento.detalles.map((detalle, i) => (
                  <div key={i} style={{ marginBottom: '0.25rem' }}>
                    • {detalle}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      {msg && (
        <div className={`alert alert--${msg.tipo}`} style={{ marginBottom: '1rem' }}>
          {msg.texto}
        </div>
      )}

      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">🔍 Buscar Trazabilidad</div>
        
        <form onSubmit={handleBuscar} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label>Buscar por:</label>
              <select
                value={busqueda.tipo}
                onChange={(e) => setBusqueda({ ...busqueda, tipo: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="lote">Número de Lote</option>
                <option value="op">Orden de Producción</option>
              </select>
            </div>
            
            <div>
              <label>
                {busqueda.tipo === 'lote' ? 'Número de Lote:' : 'Código OP:'}
              </label>
              <input
                type="text"
                value={busqueda.valor}
                onChange={(e) => setBusqueda({ ...busqueda, valor: e.target.value })}
                placeholder={busqueda.tipo === 'lote' ? 'Ej: LOT-2025-001' : 'Ej: OP-001'}
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={loading}
              style={{ padding: '0.75rem 2rem' }}
            >
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>
      </div>

      {resultado && (
        <div className="panel">
          <div className="panel__title">
            📋 Historial de Trazabilidad - {busqueda.tipo === 'lote' ? 'Lote' : 'OP'}: {busqueda.valor}
          </div>
          {renderTimeline()}
        </div>
      )}

      {!resultado && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>
            Sistema de Trazabilidad
          </h3>
          <p>Ingrese un número de lote o código de orden de producción para rastrear su historial completo</p>
        </div>
      )}
    </div>
  );
}

export default TrazabilidadPanel;
