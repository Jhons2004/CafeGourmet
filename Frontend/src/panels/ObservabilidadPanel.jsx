// ObservabilidadPanel.jsx - Monitoreo de Sistema y Operaciones
import React, { useState, useEffect } from 'react';
import { apiFacade } from '../apiFacade';

export function ObservabilidadPanel() {
  const [metricas, setMetricas] = useState({
    cpu: 0,
    memoria: 0,
    tiempoActividad: 0,
    totalOperaciones: 0,
    operacionesExitosas: 0,
    operacionesFallidas: 0,
    tiempoPromedioRespuesta: 0
  });
  
  const [operacionesRecientes, setOperacionesRecientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 3000);
  };

  // Simular métricas del sistema
  const generarMetricas = React.useCallback(() => {
    const now = Date.now();
    const baseTime = now - (Math.random() * 86400000); // Hasta 24h atrás
    
    return {
      cpu: Math.round(Math.random() * 60 + 20), // 20-80%
      memoria: Math.round(Math.random() * 40 + 30), // 30-70%
      tiempoActividad: Math.floor((now - baseTime) / 1000 / 60), // minutos
      totalOperaciones: Math.floor(Math.random() * 500 + 100),
      operacionesExitosas: Math.floor(Math.random() * 450 + 90),
      operacionesFallidas: Math.floor(Math.random() * 50 + 10),
      tiempoPromedioRespuesta: Math.round(Math.random() * 300 + 50) // ms
    };
  }, []);

  // Generar operaciones recientes
  const generarOperacionesRecientes = React.useCallback(async () => {
    const operaciones = [
      'GET /api/inventario/materias-primas',
      'POST /api/produccion/ordenes',
      'GET /api/calidad/recepciones',
      'POST /api/compras/ordenes',
      'GET /api/ventas/productos',
      'POST /api/ventas/pedidos',
      'GET /api/finanzas/cxp',
      'PATCH /api/inventario/movimientos',
      'GET /api/trazabilidad/buscar',
      'POST /api/config/usuarios'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      operacion: operaciones[Math.floor(Math.random() * operaciones.length)],
      estado: Math.random() > 0.15 ? 'exitosa' : 'fallida',
      tiempo: Math.round(Math.random() * 400 + 50),
      timestamp: new Date(Date.now() - i * 30000).toISOString()
    }));
  }, []);

  // Generar alertas
  const generarAlertas = React.useCallback(() => {
    const alertasPosibles = [
      { tipo: 'warning', mensaje: 'Uso de CPU elevado (>75%)', timestamp: new Date(Date.now() - 300000) },
      { tipo: 'info', mensaje: 'Backup completado exitosamente', timestamp: new Date(Date.now() - 600000) },
      { tipo: 'error', mensaje: '3 operaciones fallidas en el último minuto', timestamp: new Date(Date.now() - 60000) },
      { tipo: 'success', mensaje: 'Sistema operando normalmente', timestamp: new Date(Date.now() - 120000) }
    ];
    
    return alertasPosibles.filter(() => Math.random() > 0.3).map(a => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9)
    }));
  }, []);

  // Cargar datos
  const cargarDatos = React.useCallback(async () => {
    try {
      setLoading(true);
      const metricas = generarMetricas();
      const operaciones = await generarOperacionesRecientes();
      const alertas = generarAlertas();
      
      setMetricas(metricas);
      setOperacionesRecientes(operaciones);
      setAlertas(alertas);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar datos de observabilidad', 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [generarMetricas, generarOperacionesRecientes, generarAlertas]);

  useEffect(() => {
    cargarDatos();
    // Actualizar cada 5 segundos
    const interval = setInterval(cargarDatos, 5000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  // Calcular tasa de éxito
  const tasaExito = metricas.totalOperaciones > 0 
    ? ((metricas.operacionesExitosas / metricas.totalOperaciones) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      {msg && (
        <div className={`alert ${msg.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{msg.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{msg.texto}</span>
        </div>
      )}

      {/* Métricas del Sistema */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h4>💻 Uso CPU</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {metricas.cpu}%
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginTop: '8px' }}>
            <div style={{ width: `${metricas.cpu}%`, height: '100%', background: '#fff', borderRadius: '3px', transition: 'width 0.3s' }}></div>
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <h4>🧠 Memoria</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {metricas.memoria}%
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginTop: '8px' }}>
            <div style={{ width: `${metricas.memoria}%`, height: '100%', background: '#fff', borderRadius: '3px', transition: 'width 0.3s' }}></div>
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <h4>⏱️ Tiempo Activo</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {Math.floor(metricas.tiempoActividad / 60)}h {metricas.tiempoActividad % 60}m
          </div>
        </div>

        <div className="info-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <h4>✅ Tasa de Éxito</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {tasaExito}%
          </div>
        </div>
      </div>

      {/* Estadísticas de Operaciones */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel__title">📊 Estadísticas de Operaciones</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{metricas.totalOperaciones}</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>Total Operaciones</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>{metricas.operacionesExitosas}</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>Exitosas</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{metricas.operacionesFallidas}</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>Fallidas</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6' }}>{metricas.tiempoPromedioRespuesta}ms</div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>Tiempo Promedio</div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="panel" style={{ marginBottom: '1.5rem' }}>
          <div className="panel__title">🚨 Alertas</div>
          
          <div style={{ padding: '1rem' }}>
            {alertas.map(alerta => (
              <div 
                key={alerta.id}
                style={{ 
                  padding: '0.75rem 1rem', 
                  marginBottom: '0.5rem', 
                  borderRadius: '6px',
                  background: alerta.tipo === 'error' ? '#fee' : alerta.tipo === 'warning' ? '#ffe' : alerta.tipo === 'success' ? '#efe' : '#eef',
                  border: `1px solid ${alerta.tipo === 'error' ? '#fcc' : alerta.tipo === 'warning' ? '#ffc' : alerta.tipo === 'success' ? '#cfc' : '#ccf'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {alerta.tipo === 'error' ? '❌' : alerta.tipo === 'warning' ? '⚠️' : alerta.tipo === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <span>{alerta.mensaje}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {new Date(alerta.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operaciones Recientes */}
      <div className="panel">
        <div className="panel__title">🔄 Operaciones Recientes</div>
        
        <div className="table-container">
          <table className="table table--zebra">
            <thead>
              <tr>
                <th>Operación</th>
                <th>Estado</th>
                <th>Tiempo</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {operacionesRecientes.map(op => (
                <tr key={op.id}>
                  <td><code style={{ fontSize: '0.85rem' }}>{op.operacion}</code></td>
                  <td>
                    <span className={`badge ${op.estado === 'exitosa' ? 'badge--success' : 'badge--danger'}`}>
                      {op.estado === 'exitosa' ? '✅' : '❌'} {op.estado}
                    </span>
                  </td>
                  <td style={{ color: op.tiempo > 300 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                    {op.tiempo}ms
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {new Date(op.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          Cargando datos...
        </div>
      )}
    </div>
  );
}
