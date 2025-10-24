// InventarioPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

export function InventarioPanel({ token }) {
  const [granos, setGranos] = useState([]);
  const [form, setForm] = useState({ tipo: '', cantidad: '', proveedor: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Cargar inventario usando apiFacade
  const cargarGranos = async () => {
    try {
      setLoading(true);
      const data = await apiFacade.inventario.listar();
      console.log('Granos cargados:', data);
      setGranos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando granos:', err);
      mostrarMensaje(err.message || 'Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGranos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mostrarMensaje = (msg, tipo = 'success') => {
    setMensaje({ texto: msg, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  // Registrar grano usando apiFacade
  const registrarGrano = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.inventario.registrar({
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        proveedor: form.proveedor
      });
      mostrarMensaje('Grano registrado exitosamente');
      setForm({ tipo: '', cantidad: '', proveedor: '' });
      setShowAdd(false);
      cargarGranos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al registrar grano', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar grano usando apiFacade
  const actualizarGrano = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.inventario.actualizar(
        editItem._id,
        Number(editItem.cantidad)
      );
      mostrarMensaje('Stock actualizado correctamente');
      setShowEdit(false);
      setEditItem(null);
      cargarGranos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al actualizar stock', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar grano usando apiFacade
  // Eliminar grano usando apiFacade
  const eliminarGrano = async (id, tipo) => {
    if (!window.confirm(`¿Está seguro de eliminar ${tipo} del inventario?`)) return;
    
    try {
      setLoading(true);
      await apiFacade.inventario.eliminar(id);
      mostrarMensaje('Grano eliminado del inventario');
      cargarGranos();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al eliminar grano', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Abrir modal de edición
  const abrirEdicion = (grano) => {
    setEditItem({ ...grano });
    setShowEdit(true);
  };

  // Alertas de stock bajo
  const stockBajo = granos.filter(g => g.cantidad <= 10);
  const totalKg = granos.reduce((sum, g) => sum + Number(g.cantidad), 0);

  return (
    <div>
      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{mensaje.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Alertas de stock bajo */}
      {stockBajo.length > 0 && (
        <div className="alert alert--warning" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <div>
            <strong>Stock Bajo:</strong> {stockBajo.map(g => `${g.tipo} (${g.cantidad} kg)`).join(', ')}
          </div>
        </div>
      )}

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h4>📦 Total Items</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {granos.length}
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
          <h4>⚖️ Total Kg</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {totalKg.toFixed(2)}
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }}>
          <h4>⚠️ Stock Bajo</h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {stockBajo.length}
          </div>
        </div>
      </div>

      {/* Panel Principal */}
      <div className="panel">
        <div className="panel__title">📦 Inventario de Granos</div>
        
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Tipos de grano: <strong>{granos.length}</strong>
          </p>
          <button 
            className="btn btn--primary"
            onClick={() => setShowAdd(true)}
            disabled={loading}
          >
            ➕ Registrar Grano
          </button>
        </div>

        {loading && granos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-skeleton" style={{ height: '60px', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '60px' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table table--zebra">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cantidad (kg)</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {granos.map(grano => (
                  <tr key={grano._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>☕</span>
                        <strong>{grano.tipo}</strong>
                      </div>
                    </td>
                    <td>
                      <strong style={{ 
                        color: grano.cantidad <= 10 ? '#e74c3c' : '#27ae60',
                        fontSize: '1.1rem'
                      }}>
                        {grano.cantidad}
                      </strong>
                    </td>
                    <td>{grano.proveedor}</td>
                    <td>
                      {grano.cantidad <= 10 ? (
                        <span className="badge badge--danger">Stock Bajo</span>
                      ) : grano.cantidad <= 50 ? (
                        <span className="badge badge--warning">Stock Medio</span>
                      ) : (
                        <span className="badge badge--success">Stock OK</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn btn--sm btn--secondary"
                          onClick={() => abrirEdicion(grano)}
                          title="Editar stock"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn--sm btn--danger"
                          onClick={() => eliminarGrano(grano._id, grano.tipo)}
                          title="Eliminar"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {granos.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <p>No hay granos registrados en el inventario</p>
            <button 
              className="btn btn--primary"
              onClick={() => setShowAdd(true)}
              style={{ marginTop: '1rem' }}
            >
              ➕ Registrar Primer Grano
            </button>
          </div>
        )}
      </div>

      {/* Modal: Registrar Grano */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Registrar Nuevo Grano</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            
            <form onSubmit={registrarGrano}>
              <label>Tipo de Grano *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({...form, tipo: e.target.value})}
                required
              >
                <option value="">Seleccione...</option>
                <option value="arabica">Arábica</option>
                <option value="robusta">Robusta</option>
                <option value="liberica">Liberica</option>
                <option value="mezcla">Mezcla</option>
              </select>
              
              <label>Cantidad (kg) *</label>
              <input 
                type="number"
                step="0.01"
                value={form.cantidad}
                onChange={(e) => setForm({...form, cantidad: e.target.value})}
                required
                placeholder="Ej: 100"
              />
              
              <label>Proveedor *</label>
              <input 
                type="text"
                value={form.proveedor}
                onChange={(e) => setForm({...form, proveedor: e.target.value})}
                required
                placeholder="Nombre del proveedor"
              />
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Registrando...' : '✅ Registrar'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Stock */}
      {showEdit && editItem && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Actualizar Stock</h2>
              <button className="modal-close" onClick={() => setShowEdit(false)}>✕</button>
            </div>
            
            <div className="alert alert--info" style={{ marginBottom: '1rem' }}>
              <span>ℹ️</span>
              <div>
                <strong>Grano:</strong> {editItem.tipo}<br/>
                <strong>Stock actual:</strong> {editItem.cantidad} kg
              </div>
            </div>
            
            <form onSubmit={actualizarGrano}>
              <label>Nueva Cantidad (kg) *</label>
              <input 
                type="number"
                step="0.01"
                value={editItem.cantidad}
                onChange={(e) => setEditItem({...editItem, cantidad: e.target.value})}
                required
                placeholder="Nueva cantidad"
              />
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Actualizando...' : '✅ Actualizar'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowEdit(false)} style={{ flex: 1 }}>
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

export default InventarioPanel;
