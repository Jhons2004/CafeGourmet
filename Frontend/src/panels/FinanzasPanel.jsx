import React, { useState, useEffect } from 'react';
import { apiFacade } from '../apiFacade';

function FinanzasPanel() {
  const [cuentasPorPagar, setCuentasPorPagar] = useState([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [showAddCxP, setShowAddCxP] = useState(false);
  const [showAddCxC, setShowAddCxC] = useState(false);
  const [showAddTransaccion, setShowAddTransaccion] = useState(false);
  
  // Formularios
  const [newCxP, setNewCxP] = useState({
    proveedorId: '',
    monto: '',
    fechaVencimiento: '',
    moneda: 'GTQ',
    estado: 'pendiente'
  });
  
  const [newCxC, setNewCxC] = useState({
    clienteId: '',
    monto: '',
    fechaVencimiento: '',
    moneda: 'GTQ',
    estado: 'pendiente'
  });
  
  const [newTransaccion, setNewTransaccion] = useState({
    tipo: 'ingreso',
    monto: '',
    concepto: '',
    categoria: 'ventas',
    metodoPago: 'efectivo'
  });

  const mostrarMensaje = (msg, tipo = 'success') => {
    setMensaje({ texto: msg, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  // Cargar proveedores
  const cargarProveedores = React.useCallback(async () => {
    try {
      const data = await apiFacade.compras.proveedores.listar();
      console.log('Proveedores cargados:', data);
      setProveedores(data);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  }, []);

  // Cargar clientes
  const cargarClientes = React.useCallback(async () => {
    try {
      const data = await apiFacade.ventas.clientes.listar();
      console.log('Clientes cargados:', data);
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  }, []);

  const cargarCuentasPorPagar = React.useCallback(async () => {
    try {
      const data = await apiFacade.finanzas.cxp.listar();
      setCuentasPorPagar(data);
    } catch (err) {
      console.error('Error cargando CxP:', err);
      setMensaje({ texto: `Error al cargar CxP: ${err.message}`, tipo: 'error' });
      setTimeout(() => setMensaje(''), 3000);
    }
  }, []);

  const cargarCuentasPorCobrar = React.useCallback(async () => {
    try {
      const data = await apiFacade.finanzas.cxc.listar();
      setCuentasPorCobrar(data);
    } catch (err) {
      console.error('Error cargando CxC:', err);
      setMensaje({ texto: `Error al cargar CxC: ${err.message}`, tipo: 'error' });
      setTimeout(() => setMensaje(''), 3000);
    }
  }, []);

  const cargarTransacciones = React.useCallback(async () => {
    try {
      // Nota: transacciones no tiene endpoint específico en el backend actual
      // Por ahora dejamos vacío o podemos usar un endpoint custom si existe
      setTransacciones([]);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
    }
  }, []);

  // Cargar datos
  useEffect(() => {
    cargarProveedores();
    cargarClientes();
    cargarCuentasPorPagar();
    cargarCuentasPorCobrar();
    cargarTransacciones();
  }, [cargarProveedores, cargarClientes, cargarCuentasPorPagar, cargarCuentasPorCobrar, cargarTransacciones]);

  // Crear CxP usando apiFacade
  const handleCreateCxP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.finanzas.cxp.crear(newCxP);
      mostrarMensaje('Cuenta por pagar registrada');
      setNewCxP({ proveedorId: '', monto: '', fechaVencimiento: '', moneda: 'GTQ', estado: 'pendiente' });
      setShowAddCxP(false);
      cargarCuentasPorPagar();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear cuenta por pagar', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Crear CxC usando apiFacade
  const handleCreateCxC = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFacade.finanzas.cxc.crear(newCxC);
      mostrarMensaje('Cuenta por cobrar registrada');
      setNewCxC({ clienteId: '', monto: '', fechaVencimiento: '', moneda: 'GTQ', estado: 'pendiente' });
      setShowAddCxC(false);
      cargarCuentasPorCobrar();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear cuenta por cobrar', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Crear Transacción (Nota: endpoint no existe en backend actual, se deja como placeholder)
  const handleCreateTransaccion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // TODO: Implementar endpoint de transacciones en el backend
      mostrarMensaje('Función de transacciones pendiente de implementación en backend', 'error');
      setNewTransaccion({ tipo: 'ingreso', monto: '', concepto: '', categoria: 'ventas', metodoPago: 'efectivo' });
      setShowAddTransaccion(false);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear transacción', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalCxP = cuentasPorPagar.reduce((sum, c) => sum + (c.estado === 'pendiente' ? Number(c.monto) : 0), 0);
  const totalCxC = cuentasPorCobrar.reduce((sum, c) => sum + (c.estado === 'pendiente' ? Number(c.monto) : 0), 0);
  const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + Number(t.monto), 0);
  const totalEgresos = transacciones.filter(t => t.tipo === 'egreso').reduce((sum, t) => sum + Number(t.monto), 0);
  const balanceGeneral = totalIngresos - totalEgresos;

  return (
    <div>
      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{mensaje.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Dashboard Financiero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }}>
          <h4>💸 Cuentas por Pagar</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ${totalCxP.toFixed(2)}
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' }}>
          <h4>💰 Cuentas por Cobrar</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ${totalCxC.toFixed(2)}
          </div>
        </div>
        
        <div className="info-card" style={{ background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' }}>
          <h4>📈 Balance General</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ${balanceGeneral.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Cuentas por Pagar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel__title">💸 Cuentas por Pagar</div>
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>Total pendiente: <strong>${totalCxP.toFixed(2)}</strong></p>
          <button className="btn btn--primary" onClick={() => setShowAddCxP(true)}>
            ➕ Nueva CxP
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Orden Compra</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuentasPorPagar.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.proveedor?.nombre || c.proveedor || 'N/A'}</strong></td>
                  <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>${Number(c.monto).toFixed(2)}</td>
                  <td>{new Date(c.fechaVencimiento).toLocaleDateString()}</td>
                  <td>{c.ordenCompra?.numero || '-'}</td>
                  <td>
                    <span className={`badge ${c.estado === 'pagado' ? 'badge--success' : 'badge--warning'}`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cuentas por Cobrar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel__title">💰 Cuentas por Cobrar</div>
        <div className="toolbar">
          <p style={{ margin: 0, color: '#7f8c8d' }}>Total pendiente: <strong>${totalCxC.toFixed(2)}</strong></p>
          <button className="btn btn--primary" onClick={() => setShowAddCxC(true)}>
            ➕ Nueva CxC
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Factura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuentasPorCobrar.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.cliente?.nombre || c.cliente || 'N/A'}</strong></td>
                  <td style={{ color: '#27ae60', fontWeight: 'bold' }}>${Number(c.monto).toFixed(2)}</td>
                  <td>{new Date(c.fechaVencimiento).toLocaleDateString()}</td>
                  <td>{c.factura?.numero || '-'}</td>
                  <td>
                    <span className={`badge ${c.estado === 'cobrado' ? 'badge--success' : 'badge--warning'}`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transacciones */}
      <div className="panel">
        <div className="panel__title">📊 Flujo de Caja</div>
        <div className="toolbar">
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#27ae60' }}>💵 Ingresos: <strong>${totalIngresos.toFixed(2)}</strong></span>
            <span style={{ color: '#e74c3c' }}>💸 Egresos: <strong>${totalEgresos.toFixed(2)}</strong></span>
          </div>
          <button className="btn btn--primary" onClick={() => setShowAddTransaccion(true)}>
            ➕ Nueva Transacción
          </button>
        </div>
        
        <div className="table-container">
          <table className="table table--zebra">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Método de Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map(t => (
                <tr key={t._id}>
                  <td>
                    <span className={`badge ${t.tipo === 'ingreso' ? 'badge--success' : 'badge--danger'}`}>
                      {t.tipo === 'ingreso' ? '📈' : '📉'} {t.tipo}
                    </span>
                  </td>
                  <td style={{ color: t.tipo === 'ingreso' ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                    ${Number(t.monto).toFixed(2)}
                  </td>
                  <td>{t.concepto}</td>
                  <td>{t.categoria}</td>
                  <td>{t.metodoPago}</td>
                  <td>{new Date(t.fecha || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nueva CxP */}
      {showAddCxP && (
        <div className="modal-overlay" onClick={() => setShowAddCxP(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💸 Nueva Cuenta por Pagar</h2>
              <button className="modal-close" onClick={() => setShowAddCxP(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCxP}>
              <label>Proveedor *</label>
              <select
                value={newCxP.proveedorId}
                onChange={(e) => setNewCxP({...newCxP, proveedorId: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {proveedores.map(p => (
                  <option key={p._id} value={p._id}>{p.nombre}</option>
                ))}
              </select>
              <label>Monto *</label>
              <input 
                type="number"
                step="0.01"
                value={newCxP.monto}
                onChange={(e) => setNewCxP({...newCxP, monto: e.target.value})}
                required
              />
              <label>Fecha de Vencimiento *</label>
              <input 
                type="date"
                value={newCxP.fechaVencimiento}
                onChange={(e) => setNewCxP({...newCxP, fechaVencimiento: e.target.value})}
                required
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Registrando...' : '✅ Registrar'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowAddCxP(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva CxC */}
      {showAddCxC && (
        <div className="modal-overlay" onClick={() => setShowAddCxC(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Nueva Cuenta por Cobrar</h2>
              <button className="modal-close" onClick={() => setShowAddCxC(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCxC}>
              <label>Cliente *</label>
              <select
                value={newCxC.clienteId}
                onChange={(e) => setNewCxC({...newCxC, clienteId: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
              <label>Monto *</label>
              <input 
                type="number"
                step="0.01"
                value={newCxC.monto}
                onChange={(e) => setNewCxC({...newCxC, monto: e.target.value})}
                required
              />
              <label>Fecha de Vencimiento *</label>
              <input 
                type="date"
                value={newCxC.fechaVencimiento}
                onChange={(e) => setNewCxC({...newCxC, fechaVencimiento: e.target.value})}
                required
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Registrando...' : '✅ Registrar'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowAddCxC(false)} style={{ flex: 1 }}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Transacción */}
      {showAddTransaccion && (
        <div className="modal-overlay" onClick={() => setShowAddTransaccion(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Nueva Transacción</h2>
              <button className="modal-close" onClick={() => setShowAddTransaccion(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTransaccion}>
              <label>Tipo *</label>
              <select 
                value={newTransaccion.tipo}
                onChange={(e) => setNewTransaccion({...newTransaccion, tipo: e.target.value})}
                required
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
              <label>Monto *</label>
              <input 
                type="number"
                step="0.01"
                value={newTransaccion.monto}
                onChange={(e) => setNewTransaccion({...newTransaccion, monto: e.target.value})}
                required
              />
              <label>Concepto *</label>
              <input 
                type="text"
                value={newTransaccion.concepto}
                onChange={(e) => setNewTransaccion({...newTransaccion, concepto: e.target.value})}
                required
              />
              <label>Categoría *</label>
              <select 
                value={newTransaccion.categoria}
                onChange={(e) => setNewTransaccion({...newTransaccion, categoria: e.target.value})}
                required
              >
                <option value="ventas">Ventas</option>
                <option value="compras">Compras</option>
                <option value="nomina">Nómina</option>
                <option value="servicios">Servicios</option>
                <option value="impuestos">Impuestos</option>
                <option value="otros">Otros</option>
              </select>
              <label>Método de Pago *</label>
              <select 
                value={newTransaccion.metodoPago}
                onChange={(e) => setNewTransaccion({...newTransaccion, metodoPago: e.target.value})}
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
              </select>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn--primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Registrando...' : '✅ Registrar'}
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setShowAddTransaccion(false)} style={{ flex: 1 }}>
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

export default FinanzasPanel;
