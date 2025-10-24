// ComprasPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

// Factory para tarjeta de proveedor
function ProveedorCard({ proveedor }) {
  return (
    <div className="proveedor-card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div><b>Nombre:</b> {proveedor.nombre}</div>
      <div><b>RUC:</b> {proveedor.ruc}</div>
      <div><b>Contacto:</b> {proveedor.contacto}</div>
      <div><b>Teléfono:</b> {proveedor.telefono}</div>
      <div><b>Email:</b> {proveedor.email}</div>
    </div>
  );
}

// Composite para lista de proveedores
function ProveedoresList({ proveedores }) {
  return (
    <div>
      {proveedores.map(p => <ProveedorCard key={p._id || p.nombre} proveedor={p} />)}
    </div>
  );
}

export function ComprasPanel() {
  const [proveedores, setProveedores] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [showNewProveedor, setShowNewProveedor] = useState(false);
  const [showNewOrden, setShowNewOrden] = useState(false);
  const [showNewRecepcion, setShowNewRecepcion] = useState(false);
  
  // Estado para nuevo proveedor
  const [newProveedor, setNewProveedor] = useState({
    nombre: '',
    ruc: '',
    contacto: '',
    telefono: '',
    email: ''
  });
  
  // Estado para nueva orden
  const [newOrden, setNewOrden] = useState({
    proveedor: '',
    items: [{ tipo: 'arabica', cantidad: '', precioUnitario: '' }]
  });
  
  // Estado para nueva recepción
  const [newRecepcion, setNewRecepcion] = useState({
    ordenCompra: '',
    lotes: [{ tipo: 'arabica', cantidad: '', costoUnitario: '', lote: '', fechaCosecha: '', humedad: '' }],
    observaciones: ''
  });
  
  // Estado para almacenar la orden seleccionada (para mostrar cantidades)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 3000);
  };
  
  // Manejar cambio de orden seleccionada
  const handleOrdenChange = (ordenId) => {
    setNewRecepcion({...newRecepcion, ordenCompra: ordenId});
    const orden = ordenes.find(o => o._id === ordenId);
    setOrdenSeleccionada(orden);
    
    // Pre-llenar los lotes con los items de la orden
    if (orden && orden.items && orden.items.length > 0) {
      setNewRecepcion(prev => ({
        ...prev,
        ordenCompra: ordenId,
        lotes: orden.items.map(item => ({
          tipo: item.tipo,
          cantidad: item.cantidad || '', // Pre-llenar con la cantidad de la orden
          costoUnitario: item.precioUnitario || '', // Usar el precio de la orden como costo
          lote: '', // El usuario debe ingresar el número de lote
          fechaCosecha: '',
          humedad: ''
        }))
      }));
    }
  };

  // Observer: cargar proveedores
  const cargarProveedores = React.useCallback(async () => {
    try {
      const data = await apiFacade.compras.proveedores.listar();
      setProveedores(data);
    } catch (err) {
      mostrarMensaje(`Error al cargar proveedores: ${err.message}`, 'error');
    }
  }, []);
  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);

  // Observer: cargar órdenes
  const cargarOrdenes = React.useCallback(async () => {
    try {
      const data = await apiFacade.compras.ordenes.listar();
      setOrdenes(data);
    } catch (err) {
      mostrarMensaje(`Error al cargar órdenes: ${err.message}`, 'error');
    }
  }, []);
  useEffect(() => { cargarOrdenes(); }, [cargarOrdenes]);

  // Observer: cargar recepciones
  const cargarRecepciones = React.useCallback(async () => {
    try {
      const data = await apiFacade.compras.recepciones.listar();
      setRecepciones(data);
    } catch (err) {
      mostrarMensaje(`Error al cargar recepciones: ${err.message}`, 'error');
    }
  }, []);
  useEffect(() => { cargarRecepciones(); }, [cargarRecepciones]);
  
  // Crear proveedor
  const handleCrearProveedor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.compras.proveedores.crear(newProveedor);
      mostrarMensaje('Proveedor creado exitosamente');
      setNewProveedor({ nombre: '', ruc: '', contacto: '', telefono: '', email: '' });
      setShowNewProveedor(false);
      cargarProveedores();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear proveedor', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear orden
  const handleCrearOrden = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.compras.ordenes.crear({
        proveedor: newOrden.proveedor,
        items: newOrden.items.map(i => ({
          tipo: i.tipo,
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precioUnitario)
        }))
      });
      mostrarMensaje('Orden de compra creada exitosamente');
      setNewOrden({ proveedor: '', items: [{ tipo: 'arabica', cantidad: '', precioUnitario: '' }] });
      setShowNewOrden(false);
      cargarOrdenes();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear orden', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Aprobar orden de compra
  const handleAprobarOrden = async (ordenId) => {
    try {
      setLoading(true);
      await apiFacade.compras.ordenes.aprobar(ordenId, { aprobar: true });
      mostrarMensaje('Orden de compra aprobada exitosamente');
      cargarOrdenes();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al aprobar orden', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear recepción
  const handleCrearRecepcion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.compras.recepciones.crear({
        ordenCompra: newRecepcion.ordenCompra,
        lotes: newRecepcion.lotes.map(l => ({
          tipo: l.tipo,
          cantidad: Number(l.cantidad),
          costoUnitario: Number(l.costoUnitario),
          lote: l.lote,
          fechaCosecha: l.fechaCosecha || undefined,
          humedad: l.humedad ? Number(l.humedad) : undefined
        })),
        observaciones: newRecepcion.observaciones
      });
      mostrarMensaje('Recepción registrada exitosamente');
      setNewRecepcion({ ordenCompra: '', lotes: [{ tipo: 'arabica', cantidad: '', costoUnitario: '', lote: '', fechaCosecha: '', humedad: '' }], observaciones: '' });
      setShowNewRecepcion(false);
      setOrdenSeleccionada(null);
      cargarRecepciones();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear recepción', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Agregar item a orden
  const agregarItemOrden = () => {
    setNewOrden({
      ...newOrden,
      items: [...newOrden.items, { tipo: 'arabica', cantidad: '', precioUnitario: '' }]
    });
  };
  
  // Remover item de orden
  const removerItemOrden = (index) => {
    setNewOrden({
      ...newOrden,
      items: newOrden.items.filter((_, i) => i !== index)
    });
  };
  
  // Actualizar item de orden
  const actualizarItemOrden = (index, field, value) => {
    const nuevosItems = [...newOrden.items];
    nuevosItems[index][field] = value;
    setNewOrden({ ...newOrden, items: nuevosItems });
  };
  
  // Agregar lote a recepción
  const agregarLoteRecepcion = () => {
    setNewRecepcion({
      ...newRecepcion,
      lotes: [...newRecepcion.lotes, { tipo: 'arabica', cantidad: '', costoUnitario: '', lote: '', fechaCosecha: '', humedad: '' }]
    });
  };
  
  // Remover lote de recepción
  const removerLoteRecepcion = (index) => {
    setNewRecepcion({
      ...newRecepcion,
      lotes: newRecepcion.lotes.filter((_, i) => i !== index)
    });
  };
  
  // Actualizar lote de recepción
  const actualizarLoteRecepcion = (index, field, value) => {
    const nuevosLotes = [...newRecepcion.lotes];
    nuevosLotes[index][field] = value;
    setNewRecepcion({ ...newRecepcion, lotes: nuevosLotes });
  };

  return (
    <div>
      {msg && (
        <div className={`alert ${msg.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{msg.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{msg.texto}</span>
        </div>
      )}
      
      {/* Panel de Proveedores */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">🏢 Proveedores</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{proveedores.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewProveedor(true)}
            disabled={loading}
          >
            ➕ Nuevo Proveedor
          </button>
        </div>
        
        {proveedores.length > 0 ? (
          <ProveedoresList proveedores={proveedores} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            <p>No hay proveedores registrados</p>
          </div>
        )}
      </div>
      
      {/* Panel de Órdenes de Compra */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">📋 Órdenes de Compra</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{ordenes.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewOrden(true)}
            disabled={loading}
          >
            ➕ Nueva Orden
          </button>
        </div>
        
        <div>
          {ordenes.map(oc => {
            const esAprobada = oc.estado === 'aprobada';
            const esBorrador = oc.estado === 'borrador';
            
            // Determinar color de fondo según estado
            let bgColor = '#fff'; // default
            if (esAprobada) bgColor = '#e8f5e9'; // verde claro
            else if (esBorrador) bgColor = '#fff3e0'; // naranja claro
            else if (oc.estado === 'recibida') bgColor = '#e3f2fd'; // azul claro
            else if (oc.estado === 'cancelada') bgColor = '#ffebee'; // rojo claro
            
            return (
              <div key={oc._id || oc.proveedor} className="orden-card" style={{ 
                border: '1px solid #eee', 
                borderRadius: 8, 
                padding: 10, 
                marginBottom: 8,
                backgroundColor: bgColor
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: 
                        esAprobada ? '#4caf50' : 
                        esBorrador ? '#ff9800' : 
                        oc.estado === 'recibida' ? '#2196f3' : 
                        '#f44336',
                      color: 'white'
                    }}>
                      {esAprobada ? '✅ APROBADA' : 
                       esBorrador ? '📝 BORRADOR' : 
                       oc.estado === 'recibida' ? '📦 RECIBIDA' : 
                       '❌ CANCELADA'}
                    </span>
                  </div>
                  {esBorrador && (
                    <button 
                      className="btn btn--sm btn--success"
                      onClick={() => handleAprobarOrden(oc._id)}
                      disabled={loading}
                    >
                      ✓ Aprobar
                    </button>
                  )}
                </div>
                <div><b>Proveedor:</b> {typeof oc.proveedor === 'object' ? oc.proveedor.nombre : oc.proveedor}</div>
                <div><b>Items:</b> {oc.items && oc.items.length > 0 ? oc.items.map(i => `${i.tipo} (${i.cantidad} kg)`).join(', ') : 'Sin items'}</div>
                <div><b>Total:</b> Q {oc.items && oc.items.length > 0 ? oc.items.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0).toFixed(2) : '0.00'}</div>
              </div>
            );
          })}
          {ordenes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay órdenes de compra registradas</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Panel de Recepciones */}
      <div className="panel">
        <div className="panel__title">📦 Recepciones</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{recepciones.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewRecepcion(true)}
            disabled={loading}
          >
            ➕ Nueva Recepción
          </button>
        </div>
        
        <div>
          {recepciones.map(r => (
            <div key={r._id || r.ordenCompra} className="recepcion-card" style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div><b>Orden Compra:</b> {typeof r.ordenCompra === 'object' ? r.ordenCompra._id : r.ordenCompra}</div>
              <div><b>Lotes:</b> {r.lotes && r.lotes.length > 0 ? r.lotes.map(l => `${l.tipo} (${l.cantidad} kg)`).join(', ') : 'Sin lotes'}</div>
              <div><b>Observaciones:</b> {r.observaciones || 'Sin observaciones'}</div>
            </div>
          ))}
          {recepciones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay recepciones registradas</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal: Nuevo Proveedor */}
      {showNewProveedor && (
        <div className="modal-overlay" onClick={() => setShowNewProveedor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏢 Nuevo Proveedor</h2>
              <button className="modal-close" onClick={() => setShowNewProveedor(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearProveedor}>
              <label>Nombre *</label>
              <input 
                type="text"
                value={newProveedor.nombre}
                onChange={(e) => setNewProveedor({...newProveedor, nombre: e.target.value})}
                required
              />
              
              <label>RUC *</label>
              <input 
                type="text"
                value={newProveedor.ruc}
                onChange={(e) => setNewProveedor({...newProveedor, ruc: e.target.value})}
                required
              />
              
              <label>Contacto *</label>
              <input 
                type="text"
                value={newProveedor.contacto}
                onChange={(e) => setNewProveedor({...newProveedor, contacto: e.target.value})}
                required
              />
              
              <label>Teléfono *</label>
              <input 
                type="tel"
                value={newProveedor.telefono}
                onChange={(e) => setNewProveedor({...newProveedor, telefono: e.target.value})}
                required
              />
              
              <label>Email *</label>
              <input 
                type="email"
                value={newProveedor.email}
                onChange={(e) => setNewProveedor({...newProveedor, email: e.target.value})}
                required
              />
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creando...' : '✅ Crear'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewProveedor(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal: Nueva Orden */}
      {showNewOrden && (
        <div className="modal-overlay" onClick={() => setShowNewOrden(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📋 Nueva Orden de Compra</h2>
              <button className="modal-close" onClick={() => setShowNewOrden(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearOrden}>
              <label>Proveedor *</label>
              <select
                value={newOrden.proveedor}
                onChange={(e) => setNewOrden({...newOrden, proveedor: e.target.value})}
                required
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(p => (
                  <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
              </select>
              
              <label>Items *</label>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {newOrden.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem' }}>Tipo</label>
                      <select 
                        value={item.tipo}
                        onChange={(e) => actualizarItemOrden(index, 'tipo', e.target.value)}
                        required
                        style={{ width: '100%' }}
                      >
                        <option value="arabica">Arábica</option>
                        <option value="robusta">Robusta</option>
                        <option value="blend">Blend</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem' }}>Cantidad (kg)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={item.cantidad}
                        onChange={(e) => actualizarItemOrden(index, 'cantidad', e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem' }}>Precio Unit.</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarItemOrden(index, 'precioUnitario', e.target.value)}
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                    {newOrden.items.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removerItemOrden(index)}
                        className="btn btn--sm btn--danger"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={agregarItemOrden}
                  className="btn btn--sm btn--secondary"
                  style={{ width: '100%' }}
                >
                  ➕ Agregar Item
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creando...' : '✅ Crear'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewOrden(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal: Nueva Recepción */}
      {showNewRecepcion && (
        <div className="modal-overlay" onClick={() => setShowNewRecepcion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📦 Nueva Recepción</h2>
              <button className="modal-close" onClick={() => setShowNewRecepcion(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearRecepcion}>
              <label>Orden de Compra * (solo aprobadas)</label>
              <select
                value={newRecepcion.ordenCompra}
                onChange={(e) => handleOrdenChange(e.target.value)}
                required
              >
                <option value="">Seleccionar orden aprobada</option>
                {ordenes.filter(o => o.estado === 'aprobada').map(o => (
                  <option key={o._id} value={o._id}>
                    ✅ {typeof o.proveedor === 'object' ? o.proveedor.nombre : o.proveedor} - {o.items && o.items.length > 0 ? o.items.map(i => i.tipo).join(', ') : 'Sin items'}
                  </option>
                ))}
                {ordenes.filter(o => o.estado !== 'aprobada').length > 0 && (
                  <optgroup label="⏳ No Disponibles">
                    {ordenes.filter(o => o.estado !== 'aprobada').map(o => (
                      <option key={o._id} value="" disabled>
                        {o.estado === 'borrador' ? '📝' : o.estado === 'recibida' ? '📦' : '❌'} {typeof o.proveedor === 'object' ? o.proveedor.nombre : o.proveedor} - {o.estado}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {ordenes.filter(o => o.estado === 'aprobada').length === 0 && (
                <div style={{ 
                  background: '#fff3e0', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#f57c00'
                }}>
                  ⚠️ No hay órdenes aprobadas. Primero debes aprobar una orden de compra (en estado "Borrador") antes de crear una recepción.
                </div>
              )}
              
              {/* Mostrar información de la orden seleccionada */}
              {ordenSeleccionada && ordenSeleccionada.items && ordenSeleccionada.items.length > 0 && (
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1976d2' }}>
                    📋 Items de la Orden:
                  </div>
                  {ordenSeleccionada.items.map((item, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: idx < ordenSeleccionada.items.length - 1 ? '1px solid #bbdefb' : 'none'
                    }}>
                      <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                        {item.tipo}
                      </span>
                      <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {item.cantidad} kg
                      </span>
                    </div>
                  ))}
                  <div style={{ 
                    marginTop: '0.75rem', 
                    paddingTop: '0.75rem', 
                    borderTop: '2px solid #1976d2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold'
                  }}>
                    <span>Total a recepcionar:</span>
                    <span style={{ color: '#1976d2' }}>
                      {ordenSeleccionada.items.reduce((sum, item) => sum + (item.cantidad || 0), 0)} kg
                    </span>
                  </div>
                </div>
              )}
              
              <label>
                Lotes Recepcionados *
                {ordenSeleccionada && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#666', marginLeft: '0.5rem' }}>
                    (Pre-llenado con cantidades de la orden)
                  </span>
                )}
              </label>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {newRecepcion.lotes.map((lote, index) => {
                  // Buscar el item correspondiente en la orden para mostrar la cantidad esperada
                  const itemOrden = ordenSeleccionada?.items?.find(item => item.tipo === lote.tipo);
                  
                  return (
                    <div key={index} style={{ 
                      marginBottom: '1.5rem', 
                      padding: '1rem',
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '0.5rem'
                      }}>
                        <strong style={{ color: '#1976d2' }}>Lote #{index + 1}</strong>
                        {newRecepcion.lotes.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removerLoteRecepcion(index)}
                            className="btn btn--sm btn--danger"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                      
                      {/* Fila 1: Tipo y Cantidad */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Tipo de Café *
                          </label>
                          <select 
                            value={lote.tipo}
                            onChange={(e) => actualizarLoteRecepcion(index, 'tipo', e.target.value)}
                            required
                            style={{ width: '100%' }}
                          >
                            <option value="arabica">Arábica</option>
                            <option value="robusta">Robusta</option>
                            <option value="blend">Blend</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Cantidad (kg) *
                            {itemOrden && (
                              <span style={{ color: '#1976d2', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                                / {itemOrden.cantidad} kg
                              </span>
                            )}
                          </label>
                          <input 
                            type="number"
                            step="0.01"
                            value={lote.cantidad}
                            onChange={(e) => actualizarLoteRecepcion(index, 'cantidad', e.target.value)}
                            required
                            placeholder={itemOrden ? `Ordenado: ${itemOrden.cantidad}` : '0'}
                            style={{ width: '100%' }}
                          />
                          {itemOrden && lote.cantidad && Number(lote.cantidad) > itemOrden.cantidad && (
                            <div style={{ fontSize: '0.75rem', color: '#f57c00', marginTop: '0.25rem' }}>
                              ⚠️ Excede lo ordenado
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Fila 2: Costo Unitario y Número de Lote */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Costo Unitario ($/kg) *
                          </label>
                          <input 
                            type="number"
                            step="0.01"
                            value={lote.costoUnitario}
                            onChange={(e) => actualizarLoteRecepcion(index, 'costoUnitario', e.target.value)}
                            required
                            placeholder="Ej: 15.50"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Número de Lote *
                          </label>
                          <input 
                            type="text"
                            value={lote.lote}
                            onChange={(e) => actualizarLoteRecepcion(index, 'lote', e.target.value)}
                            required
                            placeholder="Ej: LOT-2025-001"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      {/* Fila 3: Fecha Cosecha y Humedad (Opcionales) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Fecha de Cosecha (opcional)
                          </label>
                          <input 
                            type="date"
                            value={lote.fechaCosecha}
                            onChange={(e) => actualizarLoteRecepcion(index, 'fechaCosecha', e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ margin: 0, marginBottom: '0.25rem', display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Humedad (%) (opcional)
                          </label>
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={lote.humedad}
                            onChange={(e) => actualizarLoteRecepcion(index, 'humedad', e.target.value)}
                            placeholder="Ej: 12.5"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button 
                  type="button"
                  onClick={agregarLoteRecepcion}
                  className="btn btn--sm btn--secondary"
                  style={{ width: '100%' }}
                >
                  ➕ Agregar Lote
                </button>
              </div>
              
              <label>Observaciones</label>
              <textarea
                value={newRecepcion.observaciones}
                onChange={(e) => setNewRecepcion({...newRecepcion, observaciones: e.target.value})}
                rows="3"
              />
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creando...' : '✅ Crear'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewRecepcion(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
