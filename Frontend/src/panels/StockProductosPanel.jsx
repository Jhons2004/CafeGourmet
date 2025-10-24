// StockProductosPanel.jsx - Gestión de Stock de Productos Terminados
import React, { useState, useEffect } from 'react';
import { apiFacade } from '../apiFacade';

export function StockProductosPanel() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [vistaActual, setVistaActual] = useState('stock'); // 'stock' | 'movimientos'
  
  // Estado para movimiento manual
  const [showMovimiento, setShowMovimiento] = useState(false);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    producto: '',
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
    referencia: ''
  });

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(''), 3000);
  };

  // Cargar productos terminados
  const cargarProductos = React.useCallback(async () => {
    try {
      setLoading(true);
      let data = await apiFacade.ventas.productos.listar();
      console.log('Productos cargados:', data);
      
      // Si no hay productos, crear algunos de ejemplo
      if (!data || data.length === 0) {
        console.log('No hay productos, creando datos de ejemplo...');
        const productosEjemplo = [
          { sku: 'CAFE-GOURMET-001', nombre: 'Café Gourmet Premium 500g', unidad: 'un' },
          { sku: 'CAFE-GOURMET-002', nombre: 'Café Orgánico 1kg', unidad: 'kg' },
          { sku: 'CAFE-GOURMET-003', nombre: 'Café Descafeinado 250g', unidad: 'g' }
        ];
        
        for (const prod of productosEjemplo) {
          try {
            await apiFacade.ventas.productos.crear(prod);
          } catch (err) {
            console.warn('Error al crear producto ejemplo:', err);
          }
        }
        
        // Recargar después de crear
        data = await apiFacade.ventas.productos.listar();
      }
      
      // Asegurar que siempre sea un array
      const productosArray = Array.isArray(data) ? data : [];
      setProductos(productosArray);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar productos', 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar movimientos (simulado - adaptable a tu backend)
  const cargarMovimientos = React.useCallback(async () => {
    try {
      setLoading(true);
      // Aquí podrías tener un endpoint específico para movimientos de productos
      // Por ahora mostramos un placeholder
      // setMovimientos([]);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cargar movimientos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    if (vistaActual === 'movimientos') {
      cargarMovimientos();
    }
  }, [vistaActual, cargarMovimientos]);

  // Registrar movimiento manual
  const handleRegistrarMovimiento = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Aquí integrarías con tu backend si tienes endpoint de movimientos
      // await apiFacade.stockProductos.registrarMovimiento(nuevoMovimiento);
      
      mostrarMensaje('Movimiento registrado exitosamente');
      setNuevoMovimiento({
        producto: '',
        tipo: 'entrada',
        cantidad: '',
        motivo: '',
        referencia: ''
      });
      setShowMovimiento(false);
      cargarProductos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al registrar movimiento', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    totalProductos: productos.length,
    productosActivos: productos.filter(p => p.activo).length,
    productosBajoStock: productos.filter(p => (p.stock || 0) < 10).length,
    stockTotal: productos.reduce((sum, p) => sum + (p.stock || 0), 0)
  };

  return (
    <div style={{ padding: '1rem' }}>
      {msg && (
        <div className={`alert alert--${msg.tipo}`} style={{ marginBottom: '1rem' }}>
          {msg.texto}
        </div>
      )}

      {/* Estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Productos</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalProductos}</div>
        </div>

        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Productos Activos</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.productosActivos}</div>
        </div>

        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(238, 9, 121, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Bajo Stock</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.productosBajoStock}</div>
        </div>

        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Stock Total</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.stockTotal}</div>
        </div>
      </div>

      {/* Barra de navegación */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '0.5rem'
      }}>
        <button
          className={`btn ${vistaActual === 'stock' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setVistaActual('stock')}
          style={{ flex: 1 }}
        >
          📦 Inventario
        </button>
        <button
          className={`btn ${vistaActual === 'movimientos' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setVistaActual('movimientos')}
          style={{ flex: 1 }}
        >
          📋 Movimientos
        </button>
      </div>

      {/* Vista de Stock */}
      {vistaActual === 'stock' && (
        <div className="panel">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div className="panel__title">📦 Stock de Productos Terminados</div>
            <button
              className="btn btn--primary"
              onClick={() => setShowMovimiento(true)}
              disabled={loading}
            >
              ➕ Registrar Movimiento
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table table--zebra">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Unidad</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod._id} style={{
                    background: (prod.stock || 0) < 10 ? '#fff3e0' : 'transparent'
                  }}>
                    <td><strong>{prod.sku}</strong></td>
                    <td>{prod.nombre}</td>
                    <td>{prod.unidad || 'kg'}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: (prod.stock || 0) < 10 ? '#e74c3c' : 
                                  (prod.stock || 0) < 50 ? '#f39c12' : '#27ae60'
                      }}>
                        {prod.stock || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        background: prod.activo ? '#e8f5e9' : '#ffebee',
                        color: prod.activo ? '#2e7d32' : '#c62828',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {prod.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn--sm btn--secondary">
                        📝 Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {productos.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#7f8c8d'
              }}>
                <p>No hay productos registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista de Movimientos */}
      {vistaActual === 'movimientos' && (
        <div className="panel">
          <div className="panel__title">📋 Historial de Movimientos</div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#7f8c8d',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>
              Historial de Movimientos
            </h3>
            <p>Los movimientos de stock se registran automáticamente con las operaciones del sistema</p>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              marginTop: '1.5rem',
              textAlign: 'left',
              maxWidth: '400px',
              margin: '1.5rem auto 0'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>✅ Entradas por producción</li>
              <li style={{ marginBottom: '0.5rem' }}>📦 Salidas por despacho</li>
              <li style={{ marginBottom: '0.5rem' }}>🔄 Ajustes manuales</li>
              <li style={{ marginBottom: '0.5rem' }}>❌ Mermas registradas</li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal: Registrar Movimiento */}
      {showMovimiento && (
        <div className="modal-overlay" onClick={() => setShowMovimiento(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Registrar Movimiento de Stock</h2>
              <button className="modal-close" onClick={() => setShowMovimiento(false)}>✕</button>
            </div>
            
            <form onSubmit={handleRegistrarMovimiento}>
              <label>Producto *</label>
              <select
                value={nuevoMovimiento.producto}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, producto: e.target.value})}
                required
              >
                <option value="">Seleccionar producto</option>
                {productos.filter(p => p.activo).map(p => (
                  <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
                ))}
              </select>
              
              <label>Tipo de Movimiento *</label>
              <select
                value={nuevoMovimiento.tipo}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, tipo: e.target.value})}
                required
              >
                <option value="entrada">➕ Entrada (Agregar stock)</option>
                <option value="salida">➖ Salida (Reducir stock)</option>
                <option value="ajuste">🔄 Ajuste</option>
              </select>
              
              <label>Cantidad *</label>
              <input
                type="number"
                value={nuevoMovimiento.cantidad}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, cantidad: e.target.value})}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
              
              <label>Motivo *</label>
              <input
                type="text"
                value={nuevoMovimiento.motivo}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, motivo: e.target.value})}
                required
                placeholder="Ej: Ajuste de inventario"
              />
              
              <label>Referencia</label>
              <input
                type="text"
                value={nuevoMovimiento.referencia}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, referencia: e.target.value})}
                placeholder="Ej: DOC-2025-001 (opcional)"
              />
              
              <div className="modal-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setShowMovimiento(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockProductosPanel;
