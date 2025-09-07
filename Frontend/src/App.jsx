

import { useEffect, useState } from 'react';
import './App.css';

const API_URL = '/api/inventario';
const PROD_URL = '/api/produccion';
const LOGIN_URL = '/api/usuario/login';
const RESET_SIMPLE_URL = '/api/usuario/reset-password-simple';
const HEALTH_URL = '/api/health';

function App() {
  const [granos, setGranos] = useState([]);
  const [form, setForm] = useState({ tipo: '', cantidad: '', proveedor: '' });
  const [editId, setEditId] = useState(null);
  const [editCantidad, setEditCantidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [user, setUser] = useState(null);
  const [loginMsg, setLoginMsg] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  // Vistas de autenticación
  const [authView, setAuthView] = useState('login'); // 'login' | 'change'
  const [changeData, setChangeData] = useState({ email: '', nuevaPassword: '', confirm: '' });
  const [changeMsg, setChangeMsg] = useState('');

  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.style.background = '';
    document.body.style.minHeight = '100vh';
  }, [theme]);

  const fetchGranos = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setGranos(data);
  };

  useEffect(() => {
    if (user) fetchGranos();
  }, [user]);

  useEffect(() => {
    // Healthcheck del backend
    (async () => {
      try {
        const res = await fetch(HEALTH_URL);
        if (res.ok) {
          const data = await res.json();
          setApiStatus(`online (db:${data.db})`);
        } else {
          setApiStatus(`offline (${res.status})`);
        }
  } catch {
        setApiStatus('offline');
      }
    })();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    try {
      const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Grano registrado correctamente');
        setForm({ tipo: '', cantidad: '', proveedor: '' });
        fetchGranos();
      } else {
        setMensaje(data.error || 'Error al registrar');
      }
    } catch {
      setMensaje('Error de conexión');
    }
  };

  const handleEdit = (id, cantidad) => {
    setEditId(id);
    setEditCantidad(cantidad);
  };

  const handleUpdate = async id => {
    setMensaje('');
    try {
      const res = await fetch(`${API_URL}/actualizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cantidad: Number(editCantidad) })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Stock actualizado');
        setEditId(null);
        fetchGranos();
      } else {
        setMensaje(data.error || 'Error al actualizar');
      }
    } catch {
      setMensaje('Error de conexión');
    }
  };

  const handleLoginChange = e => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoginMsg('');
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.usuario);
        setLogin({ email: '', password: '' });
      } else {
        setLoginMsg(data.error || 'Login incorrecto');
      }
    } catch {
      setLoginMsg('Error de conexión');
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setChangeMsg('');
    if (!changeData.nuevaPassword || changeData.nuevaPassword !== changeData.confirm) {
      setChangeMsg('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch(RESET_SIMPLE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: changeData.email, nuevaPassword: changeData.nuevaPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setChangeMsg('Contraseña actualizada. Ahora puedes iniciar sesión.');
        setAuthView('login');
        setLoginMsg('Contraseña actualizada, inicia sesión.');
        setChangeData({ email: '', nuevaPassword: '', confirm: '' });
      } else {
        setChangeMsg(data.error || 'No fue posible actualizar la contraseña');
      }
    } catch {
      setChangeMsg('Error de conexión');
    }
  };

  const [panel, setPanel] = useState('inicio');
  // Producción state
  const [ops, setOps] = useState([]);
  const [newOP, setNewOP] = useState({ producto: '', receta: [{ tipo: 'arabica', cantidad: 1 }] });
  const [stageSel, setStageSel] = useState('Tostado');
  const [modal, setModal] = useState({ open:false, opId:null, receta:[] });
  const loadOPs = async () => {
    try { const r = await fetch(PROD_URL); if (r.ok) setOps(await r.json()); }
    catch (e) { console.warn('No se pudo cargar OPs', e); }
  };
  const handleLogout = () => {
    setUser(null);
    setPanel('inicio');
  };

  if (!user) {
    return (
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: 8, color: '#666' }}>Frontend activo</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--color-boton)', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Cambiar modo claro/oscuro"
          >
            {theme === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
          </button>
        </div>
  {authView === 'login' && <h2>Iniciar sesión</h2>}
  {authView === 'change' && <h2>Cambiar contraseña</h2>}
        {apiStatus && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 12, color: apiStatus.startsWith('online') ? '#2e7d32' : '#b23' }}>
            Backend: {apiStatus}
          </div>
        )}
        {authView === 'login' && (
          <>
            <form onSubmit={handleLogin} className="panel" style={{ marginBottom: 12 }}>
              <div className="panel__title">Acceso al sistema</div>
              <label>Email:</label>
              <input type="text" name="email" value={login.email} onChange={handleLoginChange} required autoComplete="username" />
              <label>Contraseña:</label>
              <input type="password" name="password" value={login.password} onChange={handleLoginChange} required autoComplete="current-password" />
              <div style={{ display:'flex', gap:'.5rem', alignItems:'center', justifyContent:'space-between' }}>
                <button type="submit" className="btn btn--primary">Entrar</button>
                <button type="button" className="btn btn--link" onClick={() => setAuthView('change')}>Cambiar contraseña</button>
              </div>
            </form>
            {loginMsg && <div className="panel muted" style={{ color: '#b23' }}>{loginMsg}</div>}
          </>
        )}
        {authView === 'change' && (
          <>
            <form onSubmit={handleChangePassword} className="panel" style={{ marginBottom: 12 }}>
              <div className="panel__title">Cambiar contraseña</div>
              <label>Email o usuario:</label>
              <input type="text" value={changeData.email} onChange={e => setChangeData({ ...changeData, email: e.target.value })} required />
              <label>Nueva contraseña:</label>
              <input type="password" value={changeData.nuevaPassword} onChange={e => setChangeData({ ...changeData, nuevaPassword: e.target.value })} required />
              <label>Confirmar contraseña:</label>
              <input type="password" value={changeData.confirm} onChange={e => setChangeData({ ...changeData, confirm: e.target.value })} required />
              <div style={{ display:'flex', gap:'.5rem' }}>
                <button type="submit" className="btn btn--primary">Actualizar contraseña</button>
                <button type="button" className="btn btn--secondary" onClick={() => setAuthView('login')}>Volver</button>
              </div>
            </form>
            {changeMsg && <div className="panel" style={{ marginBottom: 12, color: changeMsg.includes('actualizada') ? '#2e7d32' : '#b23' }}>{changeMsg}</div>}
          </>
        )}
      </div>
    );
  }

  if (panel === 'inicio') {
    return (
      <div className="form-container" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--color-boton)', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Cambiar modo claro/oscuro"
          >
            {theme === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
          </button>
        </div>
        <h2>Bienvenido, {user.nombre}!</h2>
        <div style={{ margin: '1.2rem 0', fontSize: '1.1rem' }}>
          <b>Rol:</b> {user.rol === 'admin' ? 'Administrador' : 'Operador'}
        </div>
  <button style={{ marginBottom: 16, width: '100%' }} className="btn btn--primary" onClick={() => setPanel('inventario')}>Ir a Inventario de Granos</button>
  <button style={{ marginBottom: 16, width: '100%' }} className="btn" onClick={() => { setPanel('produccion'); loadOPs(); }}>Ir a Producción</button>
  <button className="btn btn--danger" style={{ width: '100%' }} onClick={handleLogout}>Cerrar sesión</button>
      </div>
    );
  }

  if (panel === 'inventario') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Inventario de Granos</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>
          Usuario activo: <b>{user.nombre}</b> ({user.rol})
        </div>
        <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">Registrar grano</div>
          <label>Tipo de grano:</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} required>
            <option value="">Seleccione</option>
            <option value="arabica">Arábica</option>
            <option value="robusta">Robusta</option>
            <option value="blend">Blend</option>
          </select>
          <label>Cantidad (kg):</label>
          <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="0" required />
          <label>Proveedor:</label>
          <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange} required />
          <button type="submit" className="btn btn--primary">Registrar grano</button>
        </form>
        {mensaje && <div className="panel" style={{ marginBottom: 12, color: '#b23' }}>{mensaje}</div>}
        <h3>Inventario actual</h3>
        <table className="table table--zebra">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Cantidad (kg)</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {granos.map(g => (
              <tr key={g._id}>
                <td>{g.tipo}</td>
                <td>
                  {editId === g._id ? (
                    <>
                      <input type="number" value={editCantidad} min="0" onChange={e => setEditCantidad(e.target.value)} style={{ width: 80 }} />
                      <button className="btn btn--sm btn--primary" onClick={() => handleUpdate(g._id)} style={{ marginLeft: 8 }}>Guardar</button>
                      <button className="btn btn--sm btn--secondary" onClick={() => setEditId(null)} style={{ marginLeft: 4 }}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      {g.cantidad}
                      <button className="btn btn--sm btn--secondary" onClick={() => handleEdit(g._id, g.cantidad)} style={{ marginLeft: 8 }}>Editar</button>
                    </>
                  )}
                </td>
                <td>{g.proveedor}</td>
                <td>{new Date(g.fechaRegistro).toLocaleDateString()}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (panel === 'produccion') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Producción</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>

        <form className="panel" onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await fetch(`${PROD_URL}/crear`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newOP) });
            if (r.ok) { setNewOP({ producto:'', receta:[{ tipo:'arabica', cantidad:1 }] }); loadOPs(); }
          } catch (e) { console.warn('Error al crear OP', e); }
        }}>
          <div className="panel__title">Nueva orden de producción</div>
          <label>Producto</label>
          <input value={newOP.producto} onChange={e=>setNewOP({...newOP, producto:e.target.value})} required />
          <label>Receta (tipo y cantidad en kg)</label>
          {newOP.receta.map((i,idx)=> (
            <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <select value={i.tipo} onChange={e=>{
                const r=[...newOP.receta]; r[idx].tipo=e.target.value; setNewOP({...newOP, receta:r});
              }}>
                <option value="arabica">Arábica</option>
                <option value="robusta">Robusta</option>
                <option value="blend">Blend</option>
              </select>
              <input type="number" min="0" value={i.cantidad} onChange={e=>{ const r=[...newOP.receta]; r[idx].cantidad=Number(e.target.value); setNewOP({...newOP, receta:r}); }} style={{ width:120 }}/>
              <button type="button" className="btn btn--secondary" onClick={()=>{ const r=newOP.receta.filter((_,i)=>i!==idx); setNewOP({...newOP, receta:r}); }}>Quitar</button>
            </div>
          ))}
          <button type="button" className="btn btn--secondary" onClick={()=> setNewOP({...newOP, receta:[...newOP.receta, { tipo:'arabica', cantidad:1 }]})}>Añadir ingrediente</button>
          <div style={{ height:8 }} />
          <button type="submit" className="btn btn--primary">Crear OP</button>
        </form>

        <h3>Órdenes</h3>
        <table className="table table--zebra">
          <thead>
            <tr>
              <th>Código</th><th>Producto</th><th>Estado</th><th>Etapas</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ops.map(op => (
              <tr key={op._id}>
                <td>{op.codigo}</td>
                <td>{op.producto}</td>
                <td>{op.estado}</td>
                <td>{op.etapas?.map(e=> `${e.nombre}:${e.estado}`).join(', ')}</td>
                <td>
                  <select value={stageSel} onChange={e=>setStageSel(e.target.value)} style={{ marginRight:6 }}>
                    <option>Tostado</option>
                    <option>Molido</option>
                    <option>Empaque</option>
                  </select>
                  <button className="btn btn--sm btn--secondary" onClick={async()=>{ await fetch(`${PROD_URL}/${op._id}/etapa`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ etapa:stageSel }) }); loadOPs(); }}>Avanzar</button>
                  <button className="btn btn--sm btn--secondary" style={{marginLeft:6}} onClick={()=> setModal({ open:true, opId:op._id, receta: (op.receta && op.receta.length ? op.receta.map(r=>({ tipo:r.tipo, cantidad:r.cantidad })) : [{ tipo:'arabica', cantidad:1 }]) })}>Consumir…</button>
                  <button className="btn btn--sm btn--primary" style={{marginLeft:6}} onClick={async()=>{ await fetch(`${PROD_URL}/${op._id}/cerrar`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ merma:0.1 }) }); loadOPs(); }}>Cerrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modal.open && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__content">
              <div className="modal__header">
                <div className="modal__title">Registrar consumo</div>
                <button className="btn btn--secondary" onClick={()=> setModal({ open:false, opId:null, receta:[] })}>Cerrar</button>
              </div>
              <div>
                {modal.receta.map((ing, idx) => (
                  <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                    <select value={ing.tipo} onChange={(e)=>{ const r=[...modal.receta]; r[idx].tipo = e.target.value; setModal({ ...modal, receta:r }); }}>
                      <option value="arabica">Arábica</option>
                      <option value="robusta">Robusta</option>
                      <option value="blend">Blend</option>
                    </select>
                    <input type="number" min="0" value={ing.cantidad} onChange={(e)=>{ const r=[...modal.receta]; r[idx].cantidad = Number(e.target.value); setModal({ ...modal, receta:r }); }} style={{ width:140 }} />
                    <button type="button" className="btn btn--secondary" onClick={()=>{ const r=modal.receta.filter((_,i)=>i!==idx); setModal({ ...modal, receta: r.length? r : [{ tipo:'arabica', cantidad:1 }] }); }}>Quitar</button>
                  </div>
                ))}
                <button type="button" className="btn btn--secondary" onClick={()=> setModal({ ...modal, receta:[...modal.receta, { tipo:'arabica', cantidad:1 }] })}>Añadir línea</button>
                <div className="muted" style={{ marginTop: 6 }}>Solo se enviarán líneas con cantidad mayor a 0.</div>
              </div>
              <div className="modal__footer">
                <button className="btn btn--primary" onClick={async()=>{
                  const items = modal.receta
                    .map(i=> ({ tipo:i.tipo, cantidad:Number(i.cantidad)||0 }))
                    .filter(i => i.cantidad > 0);
                  await fetch(`${PROD_URL}/${modal.opId}/consumo`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items }) });
                  setModal({ open:false, opId:null, receta:[] });
                  loadOPs();
                }}>Guardar consumo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
