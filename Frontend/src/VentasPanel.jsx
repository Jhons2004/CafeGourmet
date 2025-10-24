// VentasPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

export function VentasPanel() {
  const [clientes, setClientes] = useState([]);
  const [productosPT, setProductosPT] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [showNewProducto, setShowNewProducto] = useState(false);
  const [showNewPedido, setShowNewPedido] = useState(false);
  const [showNewFactura, setShowNewFactura] = useState(false);
  
  // Estados para formularios
  const [newCliente, setNewCliente] = useState({
    nombre: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  
  const [newProducto, setNewProducto] = useState({
    sku: '',
    nombre: '',
    unidad: 'kg',
    stockInicial: 0
  });
  
  const [newPedido, setNewPedido] = useState({
    cliente: '',
    items: [{ producto: '', cantidad: '', precio: '' }]
  });
  
  const [newFactura, setNewFactura] = useState({
    pedido: '',
    cliente: '',
    monto: '',
    metodoPago: 'efectivo'
  });

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 3000);
  };

  // Cargar clientes
  const cargarClientes = React.useCallback(async () => {
    try {
      const data = await apiFacade.ventas.clientes.listar();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar clientes', 'error');
    }
  }, []);
  useEffect(() => { cargarClientes(); }, [cargarClientes]);

  // Cargar productos PT
  const cargarProductosPT = React.useCallback(async () => {
    try {
      const data = await apiFacade.ventas.productos.listar();
      setProductosPT(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar productos', 'error');
    }
  }, []);
  useEffect(() => { cargarProductosPT(); }, [cargarProductosPT]);

  // Cargar pedidos
  const cargarPedidos = React.useCallback(async () => {
    try {
      const data = await apiFacade.ventas.pedidos.listar();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar pedidos', 'error');
    }
  }, []);
  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  // Cargar facturas
  const cargarFacturas = React.useCallback(async () => {
    try {
      const data = await apiFacade.ventas.facturas.listar();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar facturas', 'error');
    }
  }, []);
  useEffect(() => { cargarFacturas(); }, [cargarFacturas]);

  // Crear cliente
  const handleCrearCliente = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.ventas.clientes.crear(newCliente);
      mostrarMensaje('Cliente creado exitosamente');
      setNewCliente({ nombre: '', ruc: '', email: '', telefono: '', direccion: '' });
      setShowNewCliente(false);
      cargarClientes();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear producto
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const productoCreado = await apiFacade.ventas.productos.crear({
        sku: newProducto.sku,
        nombre: newProducto.nombre,
        unidad: newProducto.unidad
      });
      
      console.log('✅ Producto creado:', productoCreado);
      
      // Si se especificó stock inicial, registrarlo
      if (newProducto.stockInicial > 0 && productoCreado._id) {
        try {
          const stockResponse = await fetch('/api/inventario/stock-productos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              productoId: productoCreado._id,
              cantidad: Number(newProducto.stockInicial),
              ubicacion: 'ALM-PRINCIPAL'
            })
          });
          
          if (!stockResponse.ok) {
            const errorData = await stockResponse.json();
            console.error('❌ Error al registrar stock:', errorData);
            throw new Error(errorData.error || 'Error al registrar stock');
          }
          
          const stockData = await stockResponse.json();
          console.log('✅ Stock registrado:', stockData);
          mostrarMensaje(`Producto creado con stock inicial de ${newProducto.stockInicial} unidades`);
        } catch (err) {
          console.error('❌ Error en registro de stock:', err);
          mostrarMensaje(`Producto creado pero error al registrar stock: ${err.message}`, 'error');
        }
      } else {
        mostrarMensaje('Producto creado exitosamente (sin stock inicial)');
      }
      
      setNewProducto({ sku: '', nombre: '', unidad: 'kg', stockInicial: 0 });
      setShowNewProducto(false);
      cargarProductosPT();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear pedido
  const handleCrearPedido = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.ventas.pedidos.crear({
        cliente: newPedido.cliente,
        items: newPedido.items.map(i => ({
          producto: i.producto,
          cantidad: Number(i.cantidad),
          precio: Number(i.precio)
        }))
      });
      mostrarMensaje('Pedido creado exitosamente');
      setNewPedido({ cliente: '', items: [{ producto: '', cantidad: '', precio: '' }] });
      setShowNewPedido(false);
      cargarPedidos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear factura
  const handleCrearFactura = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.ventas.facturas.crear({
        pedidoId: newFactura.pedido
      });
      mostrarMensaje('Factura creada exitosamente');
      setNewFactura({ pedido: '', cliente: '', monto: '', metodoPago: 'efectivo' });
      setShowNewFactura(false);
      cargarFacturas();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear factura', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Confirmar pedido
  const handleConfirmarPedido = async (pedidoId) => {
    try {
      setLoading(true);
      await apiFacade.ventas.pedidos.confirmar(pedidoId);
      mostrarMensaje('Pedido confirmado exitosamente');
      cargarPedidos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al confirmar pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Despachar pedido
  const handleDespacharPedido = async (pedidoId) => {
    try {
      setLoading(true);
      console.log('🚚 Intentando despachar pedido:', pedidoId);
      await apiFacade.ventas.pedidos.despachar(pedidoId);
      mostrarMensaje('Pedido despachado exitosamente');
      cargarPedidos();
    } catch (err) {
      console.error('❌ Error al despachar:', err);
      mostrarMensaje(err.message || 'Error al despachar pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar pedido
  const handleCancelarPedido = async (pedidoId) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      setLoading(true);
      await apiFacade.ventas.pedidos.cancelar(pedidoId);
      mostrarMensaje('Pedido cancelado exitosamente');
      cargarPedidos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cancelar pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Agregar item a pedido
  const agregarItemPedido = () => {
    setNewPedido({
      ...newPedido,
      items: [...newPedido.items, { producto: '', cantidad: '', precio: '' }]
    });
  };

  // Remover item de pedido
  const removerItemPedido = (index) => {
    setNewPedido({
      ...newPedido,
      items: newPedido.items.filter((_, i) => i !== index)
    });
  };

  // Actualizar item de pedido
  const actualizarItemPedido = (index, field, value) => {
    const nuevosItems = [...newPedido.items];
    nuevosItems[index][field] = value;
    setNewPedido({ ...newPedido, items: nuevosItems });
  };

  return (
    <div style={{ padding: '1rem' }}>
      {msg && (
        <div className={`alert alert--${msg.tipo}`} style={{ marginBottom: '1rem' }}>
          {msg.texto}
        </div>
      )}

      {/* Panel de Clientes */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">👥 Clientes</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{clientes.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewCliente(true)}
            disabled={loading}
          >
            ➕ Nuevo Cliente
          </button>
        </div>
        
        <div>
          {clientes.map(c => (
            <div key={c._id || c.nombre} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div><b>Nombre:</b> {c.nombre}</div>
              <div><b>RUC:</b> {c.ruc}</div>
              <div><b>Email:</b> {c.email}</div>
              <div><b>Teléfono:</b> {c.telefono}</div>
              <div><b>Dirección:</b> {c.direccion}</div>
            </div>
          ))}
          {clientes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay clientes registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Productos PT */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">📦 Productos Terminados</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{productosPT.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewProducto(true)}
            disabled={loading}
          >
            ➕ Nuevo Producto
          </button>
        </div>
        
        <div>
          {productosPT.map(p => (
            <div key={p._id || p.sku} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div><b>SKU:</b> {p.sku}</div>
              <div><b>Nombre:</b> {p.nombre}</div>
              <div><b>Unidad:</b> {p.unidad}</div>
            </div>
          ))}
          {productosPT.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>⚠️ No hay productos terminados. Crea al menos uno para poder crear pedidos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Pedidos */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel__title">🛒 Pedidos</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{pedidos.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewPedido(true)}
            disabled={loading}
          >
            ➕ Nuevo Pedido
          </button>
        </div>
        
        <div>
          {pedidos.map(ped => {
            const estadoColors = {
              borrador: '#95a5a6',
              confirmado: '#3498db',
              despachado: '#27ae60',
              cancelado: '#e74c3c'
            };
            const estadoLabels = {
              borrador: '📝 Borrador',
              confirmado: '✅ Confirmado',
              despachado: '📦 Despachado',
              cancelado: '❌ Cancelado'
            };
            
            return (
              <div key={ped._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <strong>{ped.codigo || ped._id.slice(-6)}</strong>
                    <span style={{ 
                      marginLeft: 10, 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: '0.85em',
                      background: estadoColors[ped.estado] || '#95a5a6',
                      color: 'white'
                    }}>
                      {estadoLabels[ped.estado] || ped.estado}
                    </span>
                  </div>
                </div>
                <div><b>Cliente:</b> {typeof ped.cliente === 'object' ? ped.cliente.nombre : ped.cliente}</div>
                <div><b>Items:</b> {ped.items && ped.items.length > 0 ? ped.items.length : 0} producto(s)</div>
                <div><b>Total:</b> Q {ped.total ? ped.total.toFixed(2) : '0.00'}</div>
                
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ped.estado === 'borrador' && (
                    <>
                      <button 
                        className="btn btn--small btn--primary"
                        onClick={() => handleConfirmarPedido(ped._id)}
                        disabled={loading}
                      >
                        ✅ Confirmar
                      </button>
                      <button 
                        className="btn btn--small btn--secondary"
                        onClick={() => handleCancelarPedido(ped._id)}
                        disabled={loading}
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  )}
                  {ped.estado === 'confirmado' && (
                    <>
                      <button 
                        className="btn btn--small btn--primary"
                        onClick={() => handleDespacharPedido(ped._id)}
                        disabled={loading}
                      >
                        📦 Despachar
                      </button>
                      <button 
                        className="btn btn--small btn--secondary"
                        onClick={() => handleCancelarPedido(ped._id)}
                        disabled={loading}
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  )}
                  {ped.estado === 'despachado' && (
                    <span style={{ color: '#27ae60', fontSize: '0.9em' }}>
                      ✓ Listo para facturar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {pedidos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay pedidos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Facturas */}
      <div className="panel">
        <div className="panel__title">🧾 Facturas</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Total: <strong>{facturas.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowNewFactura(true)}
            disabled={loading}
          >
            ➕ Nueva Factura
          </button>
        </div>
        
        <div>
          {facturas.map(f => (
            <div key={f._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div><b>📄 Factura:</b> {f.numero}</div>
                <div><b>Estado:</b> <span className={`badge ${f.estado === 'emitida' ? 'badge--success' : 'badge--danger'}`}>{f.estado}</span></div>
              </div>
              <div><b>Cliente:</b> {f.pedido?.cliente?.nombre || 'N/A'}</div>
              <div><b>Fecha:</b> {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}</div>
              
              {/* Detalle de Items con Precios */}
              {f.pedido?.items && f.pedido.items.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #ccc' }}>
                  <b>📦 Items:</b>
                  <table style={{ width: '100%', marginTop: 5, fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#e9ecef' }}>
                        <th style={{ padding: 5, textAlign: 'left' }}>Producto</th>
                        <th style={{ padding: 5, textAlign: 'center' }}>Cant.</th>
                        <th style={{ padding: 5, textAlign: 'right' }}>Precio Unit.</th>
                        <th style={{ padding: 5, textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {f.pedido.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 5 }}>{item.producto?.nombre || 'N/A'}</td>
                          <td style={{ padding: 5, textAlign: 'center' }}>{item.cantidad}</td>
                          <td style={{ padding: 5, textAlign: 'right' }}>Q {(item.precio || 0).toFixed(2)}</td>
                          <td style={{ padding: 5, textAlign: 'right' }}>Q {((item.cantidad || 0) * (item.precio || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Totales */}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #ccc', textAlign: 'right' }}>
                <div><b>Subtotal:</b> Q {(f.subtotal || 0).toFixed(2)}</div>
                <div><b>Impuestos:</b> Q {(f.impuestos || 0).toFixed(2)}</div>
                <div style={{ fontSize: '1.1rem', color: '#27ae60' }}><b>Total:</b> Q {(f.total || 0).toFixed(2)}</div>
              </div>
            </div>
          ))}
          {facturas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              <p>No hay facturas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nuevo Cliente */}
      {showNewCliente && (
        <div className="modal-overlay" onClick={() => setShowNewCliente(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 Nuevo Cliente</h2>
              <button className="modal-close" onClick={() => setShowNewCliente(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearCliente}>
              <label>Nombre *</label>
              <input
                type="text"
                value={newCliente.nombre}
                onChange={(e) => setNewCliente({...newCliente, nombre: e.target.value})}
                required
              />
              
              <label>RUC</label>
              <input
                type="text"
                value={newCliente.ruc}
                onChange={(e) => setNewCliente({...newCliente, ruc: e.target.value})}
              />
              
              <label>Email</label>
              <input
                type="email"
                value={newCliente.email}
                onChange={(e) => setNewCliente({...newCliente, email: e.target.value})}
              />
              
              <label>Teléfono</label>
              <input
                type="tel"
                value={newCliente.telefono}
                onChange={(e) => setNewCliente({...newCliente, telefono: e.target.value})}
              />
              
              <label>Dirección</label>
              <textarea
                value={newCliente.direccion}
                onChange={(e) => setNewCliente({...newCliente, direccion: e.target.value})}
                rows="3"
              />
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewCliente(false)}>
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

      {/* Modal: Nuevo Producto */}
      {showNewProducto && (
        <div className="modal-overlay" onClick={() => setShowNewProducto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Nuevo Producto Terminado</h2>
              <button className="modal-close" onClick={() => setShowNewProducto(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearProducto}>
              <label>SKU (Código único) *</label>
              <input
                type="text"
                placeholder="Ejemplo: CAF-ARB-250G"
                value={newProducto.sku}
                onChange={(e) => setNewProducto({...newProducto, sku: e.target.value.toUpperCase()})}
                required
              />
              
              <label>Nombre del Producto *</label>
              <input
                type="text"
                placeholder="Ejemplo: Café Arábica 250g"
                value={newProducto.nombre}
                onChange={(e) => setNewProducto({...newProducto, nombre: e.target.value})}
                required
              />
              
              <label>Unidad de Medida *</label>
              <select
                value={newProducto.unidad}
                onChange={(e) => setNewProducto({...newProducto, unidad: e.target.value})}
                required
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="un">Unidades (un)</option>
              </select>
              
              <label>Stock Inicial</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Cantidad inicial en inventario"
                value={newProducto.stockInicial}
                onChange={(e) => setNewProducto({...newProducto, stockInicial: e.target.value})}
              />
              <div style={{ padding: '8px', background: '#f0f8ff', borderRadius: '4px', marginTop: '4px', fontSize: '0.85em' }}>
                💡 El stock inicial se registrará automáticamente en el inventario
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewProducto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Pedido */}
      {showNewPedido && (
        <div className="modal-overlay" onClick={() => setShowNewPedido(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Nuevo Pedido</h2>
              <button className="modal-close" onClick={() => setShowNewPedido(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearPedido}>
              <label>Cliente *</label>
              <select
                value={newPedido.cliente}
                onChange={(e) => setNewPedido({...newPedido, cliente: e.target.value})}
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
              
              <label>Items del Pedido *</label>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {newPedido.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select
                        value={item.producto}
                        onChange={(e) => actualizarItemPedido(index, 'producto', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {productosPT.length === 0 && (
                          <option value="" disabled>⚠️ No hay productos disponibles</option>
                        )}
                        {productosPT.map(p => (
                          <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={item.cantidad}
                        onChange={(e) => actualizarItemPedido(index, 'cantidad', e.target.value)}
                        required
                        min="1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={item.precio}
                        onChange={(e) => actualizarItemPedido(index, 'precio', e.target.value)}
                        required
                        min="0"
                      />
                      {newPedido.items.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removerItemPedido(index)}
                          className="btn btn--sm btn--danger"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={agregarItemPedido}
                  className="btn btn--sm btn--secondary"
                  style={{ width: '100%' }}
                >
                  ➕ Agregar Item
                </button>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewPedido(false)}>
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

      {/* Modal: Nueva Factura */}
      {showNewFactura && (
        <div className="modal-overlay" onClick={() => setShowNewFactura(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧾 Nueva Factura</h2>
              <button className="modal-close" onClick={() => setShowNewFactura(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCrearFactura}>
              <label>Pedido Despachado *</label>
              <select
                value={newFactura.pedido}
                onChange={(e) => setNewFactura({...newFactura, pedido: e.target.value})}
                required
              >
                <option value="">Seleccionar pedido</option>
                {pedidos.filter(p => p.estado === 'despachado').map(p => (
                  <option key={p._id} value={p._id}>
                    {p.codigo || p._id} - {typeof p.cliente === 'object' ? p.cliente.nombre : p.cliente} - Q {p.total ? p.total.toFixed(2) : '0.00'}
                  </option>
                ))}
              </select>
              
              <div style={{ padding: '10px', background: '#f0f8ff', borderRadius: '4px', marginTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>
                  ℹ️ Solo se pueden facturar pedidos despachados. El monto se calcula automáticamente.
                </p>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowNewFactura(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Emitiendo...' : 'Emitir Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
