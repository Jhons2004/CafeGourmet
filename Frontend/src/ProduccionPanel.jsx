// ProduccionPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

export function ProduccionPanel() {
  const [ops, setOps] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddOP, setShowAddOP] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOP, setSelectedOP] = useState(null);
  
  const [newOP, setNewOP] = useState({
    producto: '',
    tipoProducto: 'grano', // Tipo de producto final: grano, molido o capsula
    cantidad: '',
    receta: [{ tipo: 'arabica', cantidad: '' }]
  });

  // Cargar OPs usando apiFacade
  const cargarOPs = async () => {
    try {
      setLoading(true);
      const data = await apiFacade.produccion.listar({});
      setOps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando OPs:', err);
      mostrarMensaje(err.message || 'Error al cargar órdenes de producción', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mostrarMensaje = (msg, tipo = 'success') => {
    setMensaje({ texto: msg, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  // Agregar ítem a receta
  const agregarItemReceta = () => {
    setNewOP({
      ...newOP,
      receta: [...newOP.receta, { tipo: 'arabica', cantidad: '' }]
    });
  };

  // Remover ítem de receta
  const removerItemReceta = (index) => {
    setNewOP({
      ...newOP,
      receta: newOP.receta.filter((_, i) => i !== index)
    });
  };

  // Actualizar ítem de receta
  const actualizarItemReceta = (index, field, value) => {
    const nuevaReceta = [...newOP.receta];
    nuevaReceta[index][field] = value;
    setNewOP({ ...newOP, receta: nuevaReceta });
  };

  // Crear OP usando apiFacade
  const handleCreateOP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validar que todas las cantidades estén llenas
      const recetaValida = newOP.receta.filter(r => r.cantidad && Number(r.cantidad) > 0);
      if (recetaValida.length === 0) {
        mostrarMensaje('Debes agregar al menos un ingrediente con cantidad mayor a 0', 'error');
        setLoading(false);
        return;
      }
      
      if (!newOP.producto || newOP.producto.trim() === '') {
        mostrarMensaje('Debes ingresar el nombre del producto', 'error');
        setLoading(false);
        return;
      }
      
      const payload = {
        producto: newOP.producto.trim(),
        receta: recetaValida.map(r => ({ tipo: r.tipo, cantidad: Number(r.cantidad) }))
      };
      
      console.log('Enviando OP:', payload);
      await apiFacade.produccion.crear(payload);
      mostrarMensaje('Orden de producción creada exitosamente');
      setNewOP({ producto: '', tipoProducto: 'grano', cantidad: '', receta: [{ tipo: 'arabica', cantidad: '' }] });
      setShowAddOP(false);
      cargarOPs();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear OP', 'error');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Procesar etapa usando apiFacade
  const procesarEtapa = async (opId, etapa) => {
    try {
      await apiFacade.produccion.avanzarEtapa(opId, { etapa });
      mostrarMensaje(`Etapa ${etapa} procesada correctamente`);
      cargarOPs();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al procesar etapa', 'error');
      console.error(err);
    }
  };

  // Ver detalle de OP
  const verDetalle = (op) => {
    setSelectedOP(op);
    setShowModal(true);
  };

  return (
    <div>
      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{mensaje.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Panel de Órdenes de Producción */}
      <div className="panel">
        <div className="panel__title">🏭 Órdenes de Producción</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total de órdenes: <strong>{ops.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowAddOP(true)}
            disabled={loading}
          >
            ➕ Nueva Orden
          </button>
        </div>

        {loading && ops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            <div className="loading-skeleton" style={{ height: '100px', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '100px' }}></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {ops.map(op => (
              <div 
                key={op._id}
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>{op.producto}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                      Cantidad: {op.cantidad} kg
                    </p>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                    <strong>Receta:</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {op.receta.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: '#495057' }}>
                        • {r.tipo}: {r.cantidad} kg
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn--sm btn--secondary"
                    onClick={() => verDetalle(op)}
                    style={{ flex: 1 }}
                  >
                    👁️ Ver
                  </button>
                  <button 
                    className="btn btn--sm btn--primary"
                    onClick={() => procesarEtapa(op._id, 'tostado')}
                    style={{ flex: 1 }}
                  >
                    🔥 Tostar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {ops.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <p>No hay órdenes de producción registradas</p>
            <button 
              className="btn btn--primary"
              onClick={() => setShowAddOP(true)}
              style={{ marginTop: '1rem' }}
            >
              ➕ Crear Primera Orden
            </button>
          </div>
        )}
      </div>

      {/* Modal: Nueva Orden de Producción */}
      {showAddOP && (
        <div className="modal-overlay" onClick={() => setShowAddOP(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>🏭 Nueva Orden de Producción</h2>
              <button className="modal-close" onClick={() => setShowAddOP(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateOP}>
              <label>Nombre del Producto *</label>
              <input 
                type="text"
                value={newOP.producto}
                onChange={(e) => setNewOP({...newOP, producto: e.target.value})}
                required
                placeholder="Ej: Café Premium"
              />
              
              <label>Tipo de Producto *</label>
              <select
                value={newOP.tipoProducto}
                onChange={(e) => setNewOP({...newOP, tipoProducto: e.target.value})}
                required
              >
                <option value="grano">Grano</option>
                <option value="molido">Molido</option>
                <option value="capsula">Cápsula</option>
              </select>
              
              <label>Cantidad (kg) *</label>
              <input 
                type="number"
                step="0.01"
                value={newOP.cantidad}
                onChange={(e) => setNewOP({...newOP, cantidad: e.target.value})}
                required
                placeholder="Ej: 100"
              />
              
              <label>Receta *</label>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {newOP.receta.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem' }}>Tipo</label>
                      <select 
                        value={item.tipo}
                        onChange={(e) => actualizarItemReceta(index, 'tipo', e.target.value)}
                        required
                        style={{ width: '100%' }}
                      >
                        <option value="arabica">Arábica</option>
                        <option value="robusta">Robusta</option>
                        <option value="blend">Blend (Mezcla)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem' }}>Cantidad (kg)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={item.cantidad}
                        onChange={(e) => actualizarItemReceta(index, 'cantidad', e.target.value)}
                        required
                        placeholder="Ej: 50"
                        style={{ width: '100%' }}
                      />
                    </div>
                    {newOP.receta.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removerItemReceta(index)}
                        className="btn btn--sm btn--danger"
                        style={{ marginBottom: '0' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={agregarItemReceta}
                  className="btn btn--sm btn--secondary"
                  style={{ width: '100%' }}
                >
                  ➕ Agregar Ingrediente
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creando...' : '✅ Crear Orden'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowAddOP(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Detalle */}
      {showModal && selectedOP && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Detalle de Orden</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>{selectedOP.producto}</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Cantidad:</strong>
                  <div style={{ color: '#2c3e50' }}>{selectedOP.cantidad} kg</div>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Receta:</strong>
                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                    {selectedOP.receta.map((r, i) => (
                      <li key={i} style={{ color: '#2c3e50', marginBottom: '0.25rem' }}>
                        {r.tipo}: {r.cantidad} kg
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Fecha de Creación:</strong>
                  <div style={{ color: '#2c3e50' }}>
                    {new Date(selectedOP.fechaCreacion || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn--secondary"
              onClick={() => setShowModal(false)}
              style={{ width: '100%' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
