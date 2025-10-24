// CalidadPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

export function CalidadPanel() {
  const [qcRecepciones, setQcRecepciones] = useState([]);
  const [qcProceso, setQcProceso] = useState([]);
  const [ncs, setNCs] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [ops, setOps] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [showNewQCRecepcion, setShowNewQCRecepcion] = useState(false);
  const [showNewQCProceso, setShowNewQCProceso] = useState(false);
  const [showNewNC, setShowNewNC] = useState(false);
  
  // Estados para formularios
  const [newQCRecepcion, setNewQCRecepcion] = useState({
    recepcion: '',
    lote: '',
    mediciones: {
      humedad: '',
      acidez: '',
      defectos: ''
    },
    resultado: 'aprobado',
    notas: ''
  });
  
  const [newQCProceso, setNewQCProceso] = useState({
    op: '',
    etapa: 'tostado',
    checklist: [
      { nombre: 'Temperatura', ok: true },
      { nombre: 'Tiempo', ok: true },
      { nombre: 'Color', ok: true }
    ],
    resultado: 'aprobado',
    notas: ''
  });
  
  const [newNC, setNewNC] = useState({
    recurso: 'recepcion',
    referencia: '',
    motivo: '',
    acciones: ''
  });

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 3000);
  };

  // Cargar recepciones de compras
  const cargarRecepciones = React.useCallback(async () => {
    try {
      const data = await apiFacade.compras.recepciones.listar();
      setRecepciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando recepciones:', err);
    }
  }, []);

  // Cargar órdenes de producción
  const cargarOPs = React.useCallback(async () => {
    try {
      const data = await apiFacade.produccion.listar({});
      setOps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando OPs:', err);
    }
  }, []);

  // Cargar QC Recepciones
  const cargarQCRecepciones = React.useCallback(async () => {
    try {
      const data = await apiFacade.calidad.recepciones.listar();
      setQcRecepciones(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar QC recepciones', 'error');
    }
  }, []);

  useEffect(() => {
    cargarRecepciones();
    cargarOPs();
    cargarQCRecepciones();
  }, [cargarRecepciones, cargarOPs, cargarQCRecepciones]);

  // Cargar QC Proceso
  const cargarQCProceso = React.useCallback(async () => {
    try {
      const data = await apiFacade.calidad.proceso.listar();
      setQcProceso(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar QC proceso', 'error');
    }
  }, []);
  useEffect(() => { cargarQCProceso(); }, [cargarQCProceso]);

  // Cargar No Conformidades
  const cargarNCs = React.useCallback(async () => {
    try {
      const data = await apiFacade.calidad.noConformidades.listar();
      setNCs(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar No Conformidades', 'error');
    }
  }, []);
  useEffect(() => { cargarNCs(); }, [cargarNCs]);

  // Crear QC Recepción
  const handleCrearQCRecepcion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.calidad.recepciones.crear({
        recepcion: newQCRecepcion.recepcion,
        lote: newQCRecepcion.lote,
        mediciones: {
          humedad: Number(newQCRecepcion.mediciones.humedad),
          acidez: Number(newQCRecepcion.mediciones.acidez),
          defectos: Number(newQCRecepcion.mediciones.defectos)
        },
        resultado: newQCRecepcion.resultado,
        notas: newQCRecepcion.notas
      });
      mostrarMensaje('Inspección de recepción creada exitosamente');
      setNewQCRecepcion({
        recepcion: '',
        lote: '',
        mediciones: { humedad: '', acidez: '', defectos: '' },
        resultado: 'aprobado',
        notas: ''
      });
      setShowNewQCRecepcion(false);
      cargarQCRecepciones();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear inspección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear QC Proceso
  const handleCrearQCProceso = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.calidad.proceso.crear({
        op: newQCProceso.op,
        etapa: newQCProceso.etapa,
        checklist: newQCProceso.checklist,
        resultado: newQCProceso.resultado,
        notas: newQCProceso.notas
      });
      mostrarMensaje('Inspección de proceso creada exitosamente');
      setNewQCProceso({
        op: '',
        etapa: 'tostado',
        checklist: [
          { nombre: 'Temperatura', ok: true },
          { nombre: 'Tiempo', ok: true },
          { nombre: 'Color', ok: true }
        ],
        resultado: 'aprobado',
        notas: ''
      });
      setShowNewQCProceso(false);
      cargarQCProceso();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear inspección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear No Conformidad
  const handleCrearNC = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.calidad.noConformidades.crear(newNC);
      mostrarMensaje('No conformidad registrada exitosamente');
      setNewNC({
        recurso: 'recepcion',
        referencia: '',
        motivo: '',
        acciones: ''
      });
      setShowNewNC(false);
      cargarNCs();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al registrar no conformidad', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar item del checklist
  const actualizarItemChecklist = (index, ok) => {
    const nuevoChecklist = [...newQCProceso.checklist];
    nuevoChecklist[index].ok = ok;
    setNewQCProceso({ ...newQCProceso, checklist: nuevoChecklist });
  };

  return (
    <div style={{ padding: '1rem' }}>
      {msg && (
        <div className={`alert alert--${msg.tipo}`} style={{ marginBottom: '1rem' }}>
          {msg.texto}
        </div>
      )}

      {/* Panel de QC Recepciones */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">🔍 Inspecciones de Recepción</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{qcRecepciones.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewQCRecepcion(true)}
            disabled={loading}
          >
            ➕ Nueva Inspección
          </button>
        </div>
        
        <div>
          {qcRecepciones.map(qc => (
            <div key={qc._id} style={{ 
              border: '1px solid #eee', 
              borderRadius: 8, 
              padding: 10, 
              marginBottom: 8,
              backgroundColor: qc.resultado === 'aprobado' ? '#e8f5e9' : '#ffebee'
            }}>
              <div><b>Recepción:</b> {qc.recepcion}</div>
              <div><b>Lote:</b> {qc.lote}</div>
              <div><b>Mediciones:</b> Humedad: {qc.mediciones?.humedad}%, Acidez: {qc.mediciones?.acidez}pH, Defectos: {qc.mediciones?.defectos}</div>
              <div><b>Resultado:</b> <span style={{ 
                fontWeight: 'bold',
                color: qc.resultado === 'aprobado' ? '#4caf50' : '#f44336'
              }}>{qc.resultado?.toUpperCase()}</span></div>
              {qc.notas && <div><b>Notas:</b> {qc.notas}</div>}
            </div>
          ))}
          {qcRecepciones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay inspecciones de recepción</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de QC Proceso */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">⚙️ Inspecciones de Proceso</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{qcProceso.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewQCProceso(true)}
            disabled={loading}
          >
            ➕ Nueva Inspección
          </button>
        </div>
        
        <div>
          {qcProceso.map(qc => (
            <div key={qc._id} style={{ 
              border: '1px solid #eee', 
              borderRadius: 8, 
              padding: 10, 
              marginBottom: 8,
              backgroundColor: qc.resultado === 'aprobado' ? '#e8f5e9' : '#ffebee'
            }}>
              <div><b>OP:</b> {qc.op}</div>
              <div><b>Etapa:</b> {qc.etapa}</div>
              <div><b>Checklist:</b> {qc.checklist && qc.checklist.length > 0 ? qc.checklist.map(c => `${c.nombre}: ${c.ok ? '✅' : '❌'}`).join(', ') : 'Sin checklist'}</div>
              <div><b>Resultado:</b> <span style={{ 
                fontWeight: 'bold',
                color: qc.resultado === 'aprobado' ? '#4caf50' : '#f44336'
              }}>{qc.resultado?.toUpperCase()}</span></div>
              {qc.notas && <div><b>Notas:</b> {qc.notas}</div>}
            </div>
          ))}
          {qcProceso.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay inspecciones de proceso</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de No Conformidades */}
      <div className="panel">
        <div className="panel__title">⚠️ No Conformidades</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{ncs.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewNC(true)}
            disabled={loading}
          >
            ➕ Nueva No Conformidad
          </button>
        </div>
        
        <div>
          {ncs.map(nc => (
            <div key={nc._id} style={{ 
              border: '1px solid #f57c00', 
              borderRadius: 8, 
              padding: 10, 
              marginBottom: 8,
              backgroundColor: '#fff3e0'
            }}>
              <div><b>Recurso:</b> {nc.recurso}</div>
              <div><b>Referencia:</b> {nc.referencia}</div>
              <div><b>Motivo:</b> {nc.motivo}</div>
              <div><b>Acciones:</b> {nc.acciones}</div>
            </div>
          ))}
          {ncs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay no conformidades registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nueva Inspección de Recepción */}
      {showNewQCRecepcion && (
        <div className="modal-overlay" onClick={() => setShowNewQCRecepcion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔍 Nueva Inspección de Recepción</h2>
              <button className="modal-close" onClick={() => setShowNewQCRecepcion(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearQCRecepcion}>
              <label>Recepción *</label>
              <select
                value={newQCRecepcion.recepcion}
                onChange={(e) => setNewQCRecepcion({...newQCRecepcion, recepcion: e.target.value})}
                required
              >
                <option value="">Seleccionar recepción</option>
                {recepciones.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.codigo || r._id} - {r.observaciones || 'Sin observaciones'}
                  </option>
                ))}
              </select>
              
              <label>Número de Lote *</label>
              <input
                type="text"
                value={newQCRecepcion.lote}
                onChange={(e) => setNewQCRecepcion({...newQCRecepcion, lote: e.target.value})}
                required
                placeholder="Ej: LOT-2025-001"
              />
              
              <label>Humedad (%) *</label>
              <input
                type="number"
                step="0.1"
                value={newQCRecepcion.mediciones.humedad}
                onChange={(e) => setNewQCRecepcion({
                  ...newQCRecepcion,
                  mediciones: { ...newQCRecepcion.mediciones, humedad: e.target.value }
                })}
                required
                placeholder="Ej: 12.5"
              />
              
              <label>Acidez (pH) *</label>
              <input
                type="number"
                step="0.1"
                value={newQCRecepcion.mediciones.acidez}
                onChange={(e) => setNewQCRecepcion({
                  ...newQCRecepcion,
                  mediciones: { ...newQCRecepcion.mediciones, acidez: e.target.value }
                })}
                required
                placeholder="Ej: 4.8"
              />
              
              <label>Defectos (cantidad) *</label>
              <input
                type="number"
                value={newQCRecepcion.mediciones.defectos}
                onChange={(e) => setNewQCRecepcion({
                  ...newQCRecepcion,
                  mediciones: { ...newQCRecepcion.mediciones, defectos: e.target.value }
                })}
                required
                placeholder="Ej: 3"
              />
              
              <label>Resultado *</label>
              <select
                value={newQCRecepcion.resultado}
                onChange={(e) => setNewQCRecepcion({...newQCRecepcion, resultado: e.target.value})}
                required
              >
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">❌ Rechazado</option>
                <option value="condicional">⚠️ Condicional</option>
              </select>
              
              <label>Notas</label>
              <textarea
                value={newQCRecepcion.notas}
                onChange={(e) => setNewQCRecepcion({...newQCRecepcion, notas: e.target.value})}
                rows="3"
                placeholder="Observaciones adicionales..."
              />
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewQCRecepcion(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Inspección de Proceso */}
      {showNewQCProceso && (
        <div className="modal-overlay" onClick={() => setShowNewQCProceso(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Nueva Inspección de Proceso</h2>
              <button className="modal-close" onClick={() => setShowNewQCProceso(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearQCProceso}>
              <label>Orden de Producción *</label>
              <select
                value={newQCProceso.op}
                onChange={(e) => setNewQCProceso({...newQCProceso, op: e.target.value})}
                required
              >
                <option value="">Seleccionar OP</option>
                {ops.map(op => (
                  <option key={op._id} value={op._id}>
                    {op.codigo || op._id} - {op.producto}
                  </option>
                ))}
              </select>
              
              <label>Etapa *</label>
              <select
                value={newQCProceso.etapa}
                onChange={(e) => setNewQCProceso({...newQCProceso, etapa: e.target.value})}
                required
              >
                <option value="tostado">Tostado</option>
                <option value="molido">Molido</option>
                <option value="empaque">Empaque</option>
                <option value="almacenamiento">Almacenamiento</option>
              </select>
              
              <label>Checklist</label>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {newQCProceso.checklist.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={item.ok}
                      onChange={(e) => actualizarItemChecklist(index, e.target.checked)}
                    />
                    <label style={{ margin: 0 }}>{item.nombre}</label>
                  </div>
                ))}
              </div>
              
              <label>Resultado *</label>
              <select
                value={newQCProceso.resultado}
                onChange={(e) => setNewQCProceso({...newQCProceso, resultado: e.target.value})}
                required
              >
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">❌ Rechazado</option>
                <option value="condicional">⚠️ Condicional</option>
              </select>
              
              <label>Notas</label>
              <textarea
                value={newQCProceso.notas}
                onChange={(e) => setNewQCProceso({...newQCProceso, notas: e.target.value})}
                rows="3"
                placeholder="Observaciones adicionales..."
              />
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewQCProceso(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva No Conformidad */}
      {showNewNC && (
        <div className="modal-overlay" onClick={() => setShowNewNC(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Nueva No Conformidad</h2>
              <button className="modal-close" onClick={() => setShowNewNC(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearNC}>
              <label>Recurso *</label>
              <select
                value={newNC.recurso}
                onChange={(e) => setNewNC({...newNC, recurso: e.target.value})}
                required
              >
                <option value="recepcion">Recepción</option>
                <option value="proceso">Proceso</option>
                <option value="producto">Producto</option>
                <option value="empaque">Empaque</option>
              </select>
              
              <label>Referencia *</label>
              <input
                type="text"
                value={newNC.referencia}
                onChange={(e) => setNewNC({...newNC, referencia: e.target.value})}
                required
                placeholder="Ej: LOT-2025-001 o OP-001"
              />
              
              <label>Motivo *</label>
              <textarea
                value={newNC.motivo}
                onChange={(e) => setNewNC({...newNC, motivo: e.target.value})}
                required
                rows="3"
                placeholder="Describa el motivo de la no conformidad..."
              />
              
              <label>Acciones Correctivas *</label>
              <textarea
                value={newNC.acciones}
                onChange={(e) => setNewNC({...newNC, acciones: e.target.value})}
                required
                rows="3"
                placeholder="Describa las acciones correctivas tomadas..."
              />
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewNC(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
