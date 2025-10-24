

import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';
import { LIGHT_THEMES, DARK_THEMES, applyPalette } from './themes';

const API_URL = '/api/inventario';
const PROD_URL = '/api/produccion';
const LOGIN_URL = '/api/usuario/login';
const RESET_SIMPLE_URL = '/api/usuario/reset-password-simple';
const HEALTH_URL = '/api/health';
const VENTAS_URL = '/api/ventas';
const CALIDAD_URL = '/api/calidad';
const REPORTES_URL = '/api/reportes';

function App() {
  const [granos, setGranos] = useState([]);
  const [form, setForm] = useState({ tipo: '', cantidad: '', proveedor: '' });
  const [editId, setEditId] = useState(null);
  const [editCantidad, setEditCantidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  // Vistas de autenticación
  const [authView, setAuthView] = useState('login'); // 'login' | 'change'
  const [changeData, setChangeData] = useState({ email: '', nuevaPassword: '', confirm: '' });
  const [changeMsg, setChangeMsg] = useState('');

  const [theme, setTheme] = useState(() => localStorage.getItem('ui:mode') || 'light');
  const [palette, setPalette] = useState(() => localStorage.getItem('ui:palette') || 'espresso');
  const [showPalette, setShowPalette] = useState(false);
  const [borderStyle, setBorderStyle] = useState(() => localStorage.getItem('ui:radius') || 'rounded');
  const [numberFmt, setNumberFmt] = useState(() => localStorage.getItem('ui:numfmt') || 'fin');
  const [logoData, setLogoData] = useState(() => localStorage.getItem('ui:logo') || '');
  const paletteList = theme === 'light' ? LIGHT_THEMES : DARK_THEMES;
  useEffect(() => {
    const active = paletteList.find(p => p.name === palette) || paletteList[0];
    applyPalette(theme, active);
    document.body.dataset.radius = borderStyle;
    localStorage.setItem('ui:mode', theme);
    localStorage.setItem('ui:palette', active.name);
    localStorage.setItem('ui:radius', borderStyle);
    localStorage.setItem('ui:numfmt', numberFmt);
  }, [theme, palette, paletteList, borderStyle, numberFmt]);

  // Fullscreen
  const [isFs, setIsFs] = useState(false);
  const toggleFs = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFs(true);
    } else {
      document.exitFullscreen?.();
      setIsFs(false);
    }
  };

  // Búsqueda rápida (Ctrl+F)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const searchInputRef = useRef(null);
  const modules = [
    { key: 'inventario', label: 'Inventario', icon: '📦' },
    { key: 'produccion', label: 'Producción', icon: '🏭' },
    { key: 'compras', label: 'Compras', icon: '🛒' },
    { key: 'ventas', label: 'Ventas', icon: '🧾' },
    { key: 'calidad', label: 'Calidad', icon: '✅' },
    { key: 'reportes', label: 'Reportes', icon: '📊' },
    { key: 'finanzas', label: 'Finanzas', icon: '💰' },
    { key: 'config', label: 'Configuración', icon: '⚙️' }
  ];
  const filteredModules = modules.filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()));
  useEffect(() => { if (searchOpen) setTimeout(()=> searchInputRef.current?.focus(), 60); }, [searchOpen]);
  useEffect(() => { setActiveIdx(0); }, [searchQuery]);
  const openModule = (key) => { setPanel(key); setSearchOpen(false); setSearchQuery(''); };
  const onKeyGlobal = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault(); setSearchOpen(true); return;
    }
    if (searchOpen) {
      if (e.key === 'Escape') { setSearchOpen(false); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(filteredModules.length-1, i+1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(0, i-1)); }
      if (e.key === 'Enter') { e.preventDefault(); const mod = filteredModules[activeIdx]; if (mod) openModule(mod.key); }
    }
  }, [searchOpen, filteredModules, activeIdx]);
  useEffect(() => { window.addEventListener('keydown', onKeyGlobal); return () => window.removeEventListener('keydown', onKeyGlobal); }, [onKeyGlobal]);

  const handleLogoUpload = (file) => {
    if (!file) return; const reader = new FileReader();
    reader.onload = (ev) => { setLogoData(ev.target.result); localStorage.setItem('ui:logo', ev.target.result); };
    reader.readAsDataURL(file);
  };

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
        setToken(data.token || '');
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
  // const permiteConfig = user && ['admin','it','rrhh'].includes(user.rol); // (No usado tras rediseño de landing)
  const USERS_URL = '/api/usuario';
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ nombre:'', email:'', password:'', rol:'operador' });
  const cargarUsuarios = async ()=>{
    try { const r = await fetch(USERS_URL, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setUsers(await r.json()); }
    catch (e) { console.warn('No se pudo cargar usuarios', e); }
  };
  // Producción state
  const [ops, setOps] = useState([]);
  const [newOP, setNewOP] = useState({ producto: '', receta: [{ tipo: 'arabica', cantidad: 1 }] });
  const [stageSel, setStageSel] = useState('Tostado');
  const [modal, setModal] = useState({ open:false, opId:null, receta:[] });
  const loadOPs = async () => {
    try {
      const r = await fetch(PROD_URL);
      if (r.ok) {
        const data = await r.json();
        setOps(Array.isArray(data) ? data : (data.data || []));
      }
    }
    catch (e) { console.warn('No se pudo cargar OPs', e); }
  };
  
  // Compras state
  const COMPRAS_URL = '/api/compras';
  const [proveedores, setProveedores] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [newProveedor, setNewProveedor] = useState({ nombre: '', ruc: '', contacto: '', telefono: '', direccion: '', email: '' });
  const [newOC, setNewOC] = useState({ proveedor: '', items: [{ tipo: 'arabica', cantidad: 100, precioUnitario: 3.0 }] });
  const [newRecepcion, setNewRecepcion] = useState({ ordenCompra: '', lotes: [{ tipo: 'arabica', cantidad: 50, costoUnitario: 3.0, lote: '', fechaCosecha: '', humedad: '' }], observaciones: '' });
  const [comprasMsg, setComprasMsg] = useState('');

  const loadProveedores = async () => {
    try { 
      const r = await fetch(`${COMPRAS_URL}/proveedores`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); 
      if (r.ok) setProveedores(await r.json()); 
    } catch (e) { console.warn('No se pudo cargar proveedores', e); }
  };

  const loadOrdenes = async () => {
    try { 
      const r = await fetch(`${COMPRAS_URL}/ordenes`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); 
      if (r.ok) setOrdenes(await r.json()); 
    } catch (e) { console.warn('No se pudo cargar órdenes', e); }
  };

  const loadRecepciones = async () => {
    try { 
      const r = await fetch(`${COMPRAS_URL}/recepciones`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); 
      if (r.ok) setRecepciones(await r.json()); 
    } catch (e) { console.warn('No se pudo cargar recepciones', e); }
  };
  
  const handleLogout = () => {
    setUser(null);
    setPanel('inicio');
  };

  // Ventas state
  const [clientes, setClientes] = useState([]);
  const [productosPT, setProductosPT] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [ventasMsg, setVentasMsg] = useState('');
  const [newCliente, setNewCliente] = useState({ nombre:'', ruc:'', email:'', telefono:'', direccion:'' });
  const [newProductoPT, setNewProductoPT] = useState({ sku:'', nombre:'', unidad:'kg' });
  const [newPedido, setNewPedido] = useState({ cliente:'', items:[{ producto:'', cantidad:1, precio:0 }] });

  const loadClientes = async () => {
    try { const r = await fetch(`${VENTAS_URL}/clientes`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setClientes(await r.json()); }
    catch(e){ console.warn('No se pudo cargar clientes', e); }
  };
  const loadProductosPT = async () => {
    try { const r = await fetch(`${VENTAS_URL}/productos`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setProductosPT(await r.json()); }
    catch(e){ console.warn('No se pudo cargar productos PT', e); }
  };
  const loadPedidos = async () => {
    try { const r = await fetch(`${VENTAS_URL}/pedidos`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setPedidos(await r.json()); }
    catch(e){ console.warn('No se pudo cargar pedidos', e); }
  };
  const loadFacturas = async () => {
    try { const r = await fetch(`${VENTAS_URL}/facturas`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setFacturas(await r.json()); }
    catch(e){ console.warn('No se pudo cargar facturas', e); }
  };

  // Calidad state (QC de recepciones)
  // Reportes / Dashboard
  const [kpis, setKpis] = useState({ ventasHoy:0, facturasHoy:0, pedidosConfirmados:0, pedidosDespachados:0, stockPT:0, opsEnProceso:0, lotesBloqueados:0 });
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [mermaAgg, setMermaAgg] = useState({ merma:0, cerradas:0 });
  const loadKpis = async()=>{ try{ const r = await fetch(`${REPORTES_URL}/kpis`, { headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) setKpis(await r.json()); } catch { /*noop*/ } };
  const loadVentasDiarias = async(days=7)=>{ try{ const r = await fetch(`${REPORTES_URL}/ventas-diarias?days=${days}`, { headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) setVentasDiarias(await r.json()); } catch { /*noop*/ } };
  const loadMerma = async(days=30)=>{ try{ const r = await fetch(`${REPORTES_URL}/merma?days=${days}`, { headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) setMermaAgg(await r.json()); } catch { /*noop*/ } };
  // Simple bar chart (inline SVG) for numeric series
  const BarChart = ({ data, width=420, height=120, accessor=(d)=>d }) => {
    const vals = data.map(accessor);
    const max = Math.max(1, ...vals);
    const barW = Math.max(4, Math.floor(width / Math.max(1, data.length)) - 4);
    let x = 0;
    const bars = data.map((d, i) => {
      const v = accessor(d);
      const h = Math.round((v / max) * (height - 22));
      const rect = (<rect key={i} x={x+2} y={height - h - 18} width={barW} height={h} fill="#4a90e2" rx="2" />);
      x += barW + 4;
      return rect;
    });
    return (
      <svg width={width} height={height} role="img" aria-label="Bar chart">
        <text x="0" y="12" fill="#666" fontSize="11">max: {max.toFixed ? max.toFixed(2) : max}</text>
        <line x1="0" y1={height-18} x2={width} y2={height-18} stroke="#ddd" />
        {bars}
      </svg>
    );
  };

  // Utilidades de moneda (GTQ/USD)
  const currencySymbol = (m) => (m === 'USD' ? '$' : 'Q');
  const fmtMoney = (v, m = 'GTQ') => `${currencySymbol(m)} ${Number(v || 0).toFixed(2)}`;

  // Finanzas state and actions
  const FINANZAS_URL = '/api/finanzas';
    const [tc, setTc] = useState(null);
  const [cxp, setCxp] = useState([]);
  const [cxc, setCxc] = useState([]);
  const [cxpForm, setCxpForm] = useState({ proveedorId:'', ordenCompraId:'', fechaVencimiento:'', moneda:'GTQ', monto:'' });
  const [cxcForm, setCxcForm] = useState({ clienteId:'', facturaId:'', fechaVencimiento:'', moneda:'GTQ', monto:'' });
  const [aging, setAging] = useState(null);
  const [facturaProvModal, setFacturaProvModal] = useState({ open:false, cxpId:'', numero:'', fecha:'', adjuntoUrl:'', observaciones:'', tcUsado:'', tcFuente:'', tcFecha:'', archivo:null, uploading:false, progress:0, errorMsg:'' });

  const loadFinanzas = async ()=>{
    try { const h = token? { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
      const [r1, r2] = await Promise.all([
        fetch(`${FINANZAS_URL}/cxp`, { headers: h }),
        fetch(`${FINANZAS_URL}/cxc`, { headers: h })
      ]);
      if(r1.ok) setCxp(await r1.json());
      if(r2.ok) setCxc(await r2.json());
    } catch { /*noop*/ }
  };

  const loadAging = async ()=>{
    try { const r = await fetch(`${FINANZAS_URL}/aging`, { headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) setAging(await r.json()); }
    catch { /* noop */ }
  };

  const loadTC = async (force=false)=>{
    try { const url = `${FINANZAS_URL}/tc${force? '?force=1':''}`; const r = await fetch(url, { headers: token? { Authorization:`Bearer ${token}` } : {} }); if (r.ok) setTc(await r.json()); }
    catch { /* noop */ }
  };

  const crearCxp = async (e)=>{ e.preventDefault(); try{ const r = await fetch(`${FINANZAS_URL}/cxp`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ ...cxpForm, monto: Number(cxpForm.monto) }) }); if(r.ok){ setCxpForm({ proveedorId:'', ordenCompraId:'', fechaVencimiento:'', moneda:'GTQ', monto:'' }); await loadFinanzas(); } } catch { /*noop*/ } };
  const crearCxc = async (e)=>{ e.preventDefault(); try{ const r = await fetch(`${FINANZAS_URL}/cxc`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ ...cxcForm, monto: Number(cxcForm.monto) }) }); if(r.ok){ setCxcForm({ clienteId:'', facturaId:'', fechaVencimiento:'', moneda:'GTQ', monto:'' }); await loadFinanzas(); } } catch { /*noop*/ } };

  const pagarCxp = async (id)=>{ const monto = Number(prompt('Monto a pagar:','0')); if(!monto) return; try{ const r = await fetch(`${FINANZAS_URL}/cxp/${id}/pago`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ monto }) }); if(r.ok) await loadFinanzas(); } catch { /*noop*/ } };
  const anularCxp = async (id)=>{ if(!confirm('¿Anular esta CxP?')) return; try{ const r = await fetch(`${FINANZAS_URL}/cxp/${id}/anular`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) await loadFinanzas(); } catch { /*noop*/ } };
  const guardarFacturaProv = async ()=>{
    try{
      // Pre-chequeo anti-duplicados: mismo proveedor + mismo número
      const numeroTrim = (facturaProvModal.numero || '').trim();
      if (numeroTrim) {
        // asegurar datos frescos mínimos
        if (!cxp || cxp.length === 0) { await loadFinanzas(); }
        const actual = cxp.find(x => x._id === facturaProvModal.cxpId);
        const provId = actual && (actual.proveedor && (actual.proveedor._id || actual.proveedor));
        if (provId) {
          const dup = cxp.find(x => x._id !== facturaProvModal.cxpId
            && (x.proveedor && ((x.proveedor._id || x.proveedor) === provId))
            && x.facturaProveedor && (String(x.facturaProveedor.numero || '').trim().toLowerCase() === numeroTrim.toLowerCase())
          );
          if (dup) {
            setFacturaProvModal(prev => ({ ...prev, errorMsg: 'Ya existe otra CxP del mismo proveedor con ese número de factura.' }));
            return;
          }
        }
      }
      const payload = {
        numero: facturaProvModal.numero || undefined,
        fecha: facturaProvModal.fecha || undefined,
        adjuntoUrl: facturaProvModal.adjuntoUrl || undefined,
        observaciones: facturaProvModal.observaciones || undefined,
        tcUsado: facturaProvModal.tcUsado ? Number(facturaProvModal.tcUsado) : undefined
      };
      const r = await fetch(`${FINANZAS_URL}/cxp/${facturaProvModal.cxpId}/factura`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
      if(r.ok){ setFacturaProvModal({ open:false, cxpId:'', numero:'', fecha:'', adjuntoUrl:'', observaciones:'', tcUsado:'', archivo:null, uploading:false }); await loadFinanzas(); }
    } catch { /* noop */ }
  };
  const subirAdjuntoFacturaProv = async ()=>{
    try{
      const file = facturaProvModal.archivo;
      if(!file) return;
      // Validación previa: tipo y tamaño
      const allowed = ['application/pdf','image/jpeg','image/png'];
      if (!allowed.includes(file.type)) {
        setFacturaProvModal(prev=> ({ ...prev, errorMsg:'Tipo de archivo no permitido. Usa PDF/JPG/PNG.' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10 MB
        setFacturaProvModal(prev=> ({ ...prev, errorMsg:'Archivo demasiado grande (máx 10 MB).' }));
        return;
      }
      setFacturaProvModal(prev=> ({ ...prev, uploading:true, progress:0, errorMsg:'' }));
      const fd = new FormData();
      fd.append('archivo', file);
      // Usar XHR para progreso
      await new Promise((resolve)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${FINANZAS_URL}/cxp/${facturaProvModal.cxpId}/factura/adjunto`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (ev)=>{
          if (ev.lengthComputable) {
            const p = Math.round((ev.loaded / ev.total) * 100);
            setFacturaProvModal(prev=> ({ ...prev, progress: p }));
          }
        };
        xhr.onreadystatechange = ()=>{
          if (xhr.readyState === 4) {
            try {
              if (xhr.status >= 200 && xhr.status < 300) {
                const doc = JSON.parse(xhr.responseText || '{}');
                const url = (doc && doc.facturaProveedor && doc.facturaProveedor.adjuntoUrl) || '';
                setFacturaProvModal(prev=> ({ ...prev, adjuntoUrl: url, archivo:null, uploading:false, progress:100 }));
              } else {
                setFacturaProvModal(prev=> ({ ...prev, uploading:false, errorMsg: xhr.responseText || 'Error al subir.' }));
              }
            } catch {
              setFacturaProvModal(prev=> ({ ...prev, uploading:false, errorMsg:'Error al procesar respuesta.' }));
            }
            resolve();
          }
        };
        xhr.send(fd);
      });
    } catch { setFacturaProvModal(prev=> ({ ...prev, uploading:false, errorMsg:'Error inesperado al subir.' })); }
  };
  const cobrarCxc = async (id)=>{ const monto = Number(prompt('Monto a cobrar:','0')); if(!monto) return; try{ const r = await fetch(`${FINANZAS_URL}/cxc/${id}/cobro`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ monto }) }); if(r.ok) await loadFinanzas(); } catch { /*noop*/ } };
  const anularCxc = async (id)=>{ if(!confirm('¿Anular esta CxC?')) return; try{ const r = await fetch(`${FINANZAS_URL}/cxc/${id}/anular`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); if(r.ok) await loadFinanzas(); } catch { /*noop*/ } };
  const [qcRecepciones, setQcRecepciones] = useState([]);
  const [newQCRecep, setNewQCRecep] = useState({ recepcion:'', lote:'', mediciones:{ humedad:'', acidez:'', defectos:'' }, resultado:'aprobado', notas:'' });
  const loadQCRecepciones = async () => {
    try { const r = await fetch(`${CALIDAD_URL}/recepciones`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setQcRecepciones(await r.json()); }
    catch(e){ console.warn('No se pudo cargar QC recepciones', e); }
  };

  // Calidad state (QC de proceso)
  const [qcProceso, setQcProceso] = useState([]);
  const [newQCProc, setNewQCProc] = useState({ op:'', etapa:'Tostado', checklist:[{ nombre:'Parámetros OK', ok:true }], resultado:'aprobado', notas:'' });
  const loadQCProceso = async () => {
    try { const r = await fetch(`${CALIDAD_URL}/proceso`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setQcProceso(await r.json()); }
    catch(e){ console.warn('No se pudo cargar QC proceso', e); }
  };

  // Calidad state (No Conformidades)
  const [ncs, setNCs] = useState([]);
  const [newNC, setNewNC] = useState({ recurso:'lote', referencia:'', motivo:'', acciones:'' });
  const loadNCs = async () => {
    try { const r = await fetch(`${CALIDAD_URL}/nc`, { headers: token? { Authorization: `Bearer ${token}` } : {} }); if (r.ok) setNCs(await r.json()); }
    catch(e){ console.warn('No se pudo cargar No Conformidades', e); }
  };

  if (!user) {
    return (
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '0.85rem', opacity: 0.7 }}>
          Sistema activo
        </div>
        
        {apiStatus && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 16, 
            fontSize: '0.85rem', 
            color: apiStatus.startsWith('online') ? '#27ae60' : '#e74c3c',
            padding: '8px',
            background: apiStatus.startsWith('online') ? '#efffef' : '#fee',
            borderRadius: '8px'
          }}>
            Backend: {apiStatus}
          </div>
        )}

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">☕ Café Gourmet</div>
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: 0 }}>
            Sistema de Gestión Empresarial
          </p>
        </div>
        
        {authView === 'login' && (
          <>
            <form onSubmit={handleLogin} className="panel" style={{ marginBottom: 16 }}>
              <div className="panel__title">Iniciar sesión</div>
              <label>Email:</label>
              <input 
                type="text" 
                name="email" 
                value={login.email} 
                onChange={handleLoginChange} 
                required 
                autoComplete="username"
                placeholder="usuario@cafe.com"
              />
              <label>Contraseña:</label>
              <input 
                type="password" 
                name="password" 
                value={login.password} 
                onChange={handleLoginChange} 
                required 
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                  Entrar
                </button>
                <button 
                  type="button" 
                  className="btn btn--link" 
                  onClick={() => setAuthView('change')}
                  style={{ fontSize: '0.85rem' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
            {loginMsg && (
              <div className="panel" style={{ 
                color: '#e74c3c', 
                background: '#fee',
                textAlign: 'center',
                padding: '12px',
                fontSize: '0.9rem'
              }}>
                {loginMsg}
              </div>
            )}
          </>
        )}
        
        {authView === 'change' && (
          <>
            <form onSubmit={handleChangePassword} className="panel" style={{ marginBottom: 16 }}>
              <div className="panel__title">Cambiar contraseña</div>
              <label>Email o usuario:</label>
              <input 
                type="text" 
                value={changeData.email} 
                onChange={e => setChangeData({ ...changeData, email: e.target.value })} 
                required
                placeholder="usuario@cafe.com"
              />
              <label>Nueva contraseña:</label>
              <input 
                type="password" 
                value={changeData.nuevaPassword} 
                onChange={e => setChangeData({ ...changeData, nuevaPassword: e.target.value })} 
                required
                placeholder="••••••••"
              />
              <label>Confirmar contraseña:</label>
              <input 
                type="password" 
                value={changeData.confirm} 
                onChange={e => setChangeData({ ...changeData, confirm: e.target.value })} 
                required
                placeholder="••••••••"
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                  Actualizar contraseña
                </button>
                <button 
                  type="button" 
                  className="btn btn--secondary" 
                  onClick={() => setAuthView('login')}
                  style={{ flex: 1 }}
                >
                  Volver
                </button>
              </div>
            </form>
            {changeMsg && (
              <div className="panel" style={{ 
                color: changeMsg.includes('actualizada') ? '#27ae60' : '#e74c3c',
                background: changeMsg.includes('actualizada') ? '#efffef' : '#fee',
                textAlign: 'center',
                padding: '12px',
                fontSize: '0.9rem'
              }}>
                {changeMsg}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (panel === 'inicio') {
    const openAndLoad = (key) => {
      if (key === 'inventario') setPanel('inventario');
      if (key === 'produccion') { setPanel('produccion'); loadOPs(); }
      if (key === 'compras') { setPanel('compras'); loadProveedores(); loadOrdenes(); loadRecepciones(); }
      if (key === 'ventas') { setPanel('ventas'); loadClientes(); loadProductosPT(); loadPedidos(); loadFacturas(); }
      if (key === 'calidad') { setPanel('calidad'); loadRecepciones(); loadQCRecepciones(); loadQCProceso(); loadNCs(); loadOPs(); }
      if (key === 'reportes') { setPanel('reportes'); loadKpis(); loadVentasDiarias(7); loadMerma(30); }
      if (key === 'finanzas') { setPanel('finanzas'); loadFinanzas(); loadProveedores(); loadOrdenes(); loadClientes(); loadPedidos(); loadFacturas(); loadAging(); loadTC(false); }
      if (key === 'config') { setPanel('config'); cargarUsuarios(); }
    };
    return (
      <>
        <div className="user-badge">
          <div style={{ fontSize:'.85rem', lineHeight:1.2 }}>
            <strong>{user.nombre}</strong><br />
            <span style={{ fontSize:'.65rem', opacity:.75 }}>{user.rol}</span>
          </div>
          <button className="btn btn--sm btn--secondary" onClick={handleLogout}>Salir</button>
        </div>
        <button className="fullscreen-toggle" onClick={toggleFs} aria-label="Pantalla completa">{isFs ? '⤢' : '⤢'}</button>
        <button className="palette-trigger" onClick={()=> setShowPalette(s=>!s)} aria-label="Temas y personalización">🎨</button>
        {showPalette && (
          <div className="palette-panel" onKeyDown={e=> e.stopPropagation()}>
            <div style={{ fontWeight:600, marginBottom:6, fontSize:'.9rem' }}>Light Theme</div>
            <div className="palette-row">
              {LIGHT_THEMES.map(p => (
                <div key={p.name} className={`swatch ${palette===p.name? 'selected':''}`} style={{ background:p.accent }} onClick={()=> { setTheme('light'); setPalette(p.name); }} title={p.label} />
              ))}
            </div>
            <div style={{ fontWeight:600, margin:'4px 0 6px', fontSize:'.9rem' }}>Dark Theme</div>
            <div className="palette-row">
              {DARK_THEMES.map(p => (
                <div key={p.name} className={`swatch ${palette===p.name? 'selected':''}`} style={{ background:p.accent }} onClick={()=> { setTheme('dark'); setPalette(p.name); }} title={p.label} />
              ))}
            </div>
            <div style={{ display:'flex', gap:8, margin:'10px 0 8px', flexWrap:'wrap' }}>
              <button className="btn btn--sm btn--secondary" onClick={()=> setTheme(t=> t==='light' ? 'dark':'light')}>{theme==='light'? '🌙 Oscuro':'☀️ Claro'}</button>
              <button className="btn btn--sm btn--secondary" onClick={()=> setBorderStyle(r=> r==='rounded'?'flat':'rounded')}>{borderStyle==='rounded'?'🔲 Esquinas planas':'🟢 Esquinas redondas'}</button>
              <button className="btn btn--sm btn--secondary" onClick={()=> setNumberFmt(f=> f==='fin'? 'natural':'fin')}>{numberFmt==='fin'?'123 Financiero':'123 Natural'}</button>
            </div>
            <div style={{ fontSize:'.65rem', opacity:.6 }}>Preferencias guardadas localmente · {palette}</div>
          </div>
        )}
        <div className="form-container" style={{ maxWidth:920, animation:'fadeIn .6s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'1.2rem' }}>
            {logoData ? <img src={logoData} alt="Logo" style={{ maxWidth:140, maxHeight:120, objectFit:'contain', filter: theme==='dark'? 'drop-shadow(0 4px 8px rgba(0,0,0,.6))':'' }} /> : <h1 className="brand-logo">Cafe<span style={{ fontWeight:300 }}>Gourmet</span></h1>}
            <h2 style={{ margin:'0.4rem 0 .2rem', fontSize:'1.9rem' }}>Bienvenido a <span style={{ color:'var(--accent)' }}>Cafe Gourmet</span>, {user.nombre.split(' ')[0]} ☕</h2>
            <div className="tagline">El verdadero sabor del café</div>
          </div>
          <div className="landing-grid">
            {modules.map(m => (
              <div key={m.key} tabIndex={0} className="landing-card" onClick={()=> openAndLoad(m.key)} onKeyDown={e=> { if(e.key==='Enter') openAndLoad(m.key); }}>
                <div style={{ fontSize:'1.8rem' }}>{m.icon}</div>
                <h4>{m.label}</h4>
                {m.key==='reportes' && <span className="ribbon">KPIs</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'2rem', textAlign:'center', fontSize:'.75rem', opacity:.55 }}>© {new Date().getFullYear()} Cafe Gourmet – Interfaz adaptativa</div>
        </div>
        {searchOpen && (
          <div className="search-overlay" onClick={()=> setSearchOpen(false)}>
            <div className="search-box" onClick={e=> e.stopPropagation()}>
              <input ref={searchInputRef} placeholder="Buscar módulo… (Esc para cerrar)" value={searchQuery} onChange={e=> setSearchQuery(e.target.value)} />
              <div className="search-results">
                {filteredModules.map((m,i)=> (
                  <div key={m.key} className={`search-item ${i===activeIdx? 'active':''}`} onMouseEnter={()=> setActiveIdx(i)} onClick={()=> openAndLoad(m.key)}>
                    <span>{m.icon} {m.label}</span>
                    <span style={{ fontSize:'.65rem', opacity:.6 }}>Enter</span>
                  </div>
                ))}
                {filteredModules.length===0 && <div className="search-item" style={{ opacity:.6 }}>Sin resultados</div>}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }



  if (panel === 'finanzas') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Gestión Financiera</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>Usuario: <b>{user.nombre}</b> ({user.rol})</div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>Tipo de cambio (GTQ/USD)</span>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn--secondary" onClick={()=> loadTC(true)}>Actualizar TC</button>
            </div>
          </div>
          {!tc ? (
            <div className="muted">Cargando tipo de cambio…</div>
          ) : (
            <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              <div className="kpi"><div className="kpi__label">Referencia</div><div className="kpi__value">Q {Number(tc.referencia||0).toFixed(4)} / $ 1</div></div>
              {tc.compra!=null && <div className="kpi"><div className="kpi__label">Compra</div><div className="kpi__value">Q {Number(tc.compra||0).toFixed(4)}</div></div>}
              {tc.venta!=null && <div className="kpi"><div className="kpi__label">Venta</div><div className="kpi__value">Q {Number(tc.venta||0).toFixed(4)}</div></div>}
              <div className="muted" style={{ fontSize:12 }}>Fecha: {tc.fecha||'--'} · Fuente: {tc.fuente || 'Banguat'}</div>
            </div>
          )}
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>📊 Aging CxP / CxC</span>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn--secondary" onClick={()=> { loadAging(); }}>Refrescar aging</button>
            </div>
          </div>
          {!aging ? (
            <div className="muted">Cargando…</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {/* CxP */}
              <div>
                <div style={{ fontWeight:600, marginBottom:8 }}>Cuentas por Pagar</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                  {Object.entries((aging.cxp && aging.cxp.totals) || {}).map(([k,v])=> (
                    <span key={k} className="kpi" style={{ padding:'6px 10px' }}>
                      <span className="kpi__label" style={{ fontSize:11 }}>{k}</span>
                      <span className="kpi__value">{Number(v).toFixed ? Number(v).toFixed(2) : v}</span>
                    </span>
                  ))}
                </div>
                {aging.cxp && (
                  <div style={{ overflowX:'auto' }}>
                    <BarChart data={Object.entries(aging.cxp.totals).map(([k,v])=> ({ label:k, value:Number(v)||0 }))} accessor={(d)=>d.value} width={Math.max(320, (Object.keys(aging.cxp.totals).length||1)*36)} />
                  </div>
                )}
              </div>
              {/* CxC */}
              <div>
                <div style={{ fontWeight:600, marginBottom:8 }}>Cuentas por Cobrar</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                  {Object.entries((aging.cxc && aging.cxc.totals) || {}).map(([k,v])=> (
                    <span key={k} className="kpi" style={{ padding:'6px 10px' }}>
                      <span className="kpi__label" style={{ fontSize:11 }}>{k}</span>
                      <span className="kpi__value">{Number(v).toFixed ? Number(v).toFixed(2) : v}</span>
                    </span>
                  ))}
                </div>
                {aging.cxc && (
                  <div style={{ overflowX:'auto' }}>
                    <BarChart data={Object.entries(aging.cxc.totals).map(([k,v])=> ({ label:k, value:Number(v)||0 }))} accessor={(d)=>d.value} width={Math.max(320, (Object.keys(aging.cxc.totals).length||1)*36)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">Cuentas por Pagar</div>
          <form className="row" onSubmit={crearCxp}>
            <select value={cxpForm.proveedorId} onChange={e=> setCxpForm({ ...cxpForm, proveedorId: e.target.value })} required>
              <option value="">Proveedor…</option>
              {proveedores.map(p=> (
                <option key={p._id} value={p._id}>{p.nombre}{p.ruc?` (${p.ruc})`:''}</option>
              ))}
            </select>
            <select value={cxpForm.ordenCompraId} onChange={e=> {
              const val = e.target.value;
              const oc = ordenes.find(o=> o._id === val);
              if (oc) {
                const provId = (oc.proveedor && (oc.proveedor._id || oc.proveedor)) || cxpForm.proveedorId;
                const monto = (oc.total != null) ? String(oc.total) : cxpForm.monto;
                setCxpForm(prev => ({ ...prev, ordenCompraId: val, proveedorId: provId || prev.proveedorId, monto }));
              } else {
                setCxpForm(prev => ({ ...prev, ordenCompraId: val }));
              }
            }}>
              <option value="">Orden de compra (opcional)…</option>
              {ordenes.filter(o=> ['aprobada','recibida'].includes(o.estado)).map(o=> (
                <option key={o._id} value={o._id}>{o.numero} - {o.proveedor?.nombre} - {fmtMoney(o.total, 'GTQ')}</option>
              ))}
            </select>
            <input type="date" value={cxpForm.fechaVencimiento} onChange={e=> setCxpForm({ ...cxpForm, fechaVencimiento: e.target.value })} required />
            <select value={cxpForm.moneda} onChange={e=> {
              const newMon = e.target.value; const oldMon = cxpForm.moneda; const val = Number(cxpForm.monto);
              let newMonto = cxpForm.monto;
              if (tc && Number.isFinite(val) && oldMon !== newMon && val > 0 && tc.referencia) {
                if (oldMon === 'GTQ' && newMon === 'USD') newMonto = (val / Number(tc.referencia)).toFixed(2);
                if (oldMon === 'USD' && newMon === 'GTQ') newMonto = (val * Number(tc.referencia)).toFixed(2);
              }
              setCxpForm({ ...cxpForm, moneda: newMon, monto: String(newMonto) });
            }}><option value="GTQ">GTQ</option><option value="USD">USD</option></select>
            <input type="number" step="0.01" placeholder="Monto" value={cxpForm.monto} onChange={e=> setCxpForm({ ...cxpForm, monto: e.target.value })} required />
            <button className="btn">Crear</button>
          </form>
          <div style={{ marginTop:8 }}>
            <button className="btn btn--secondary" onClick={()=> { loadFinanzas(); loadProveedores(); loadOrdenes(); }}>Refrescar</button>
          </div>
          <table className="table table--zebra" style={{ marginTop:8 }}>
            <thead><tr><th>Proveedor</th><th>Monto</th><th>Saldo</th><th>Vence</th><th>Factura Prov.</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {cxp.map(i => (
                <tr key={i._id}>
                  <td>{i.proveedor?.nombre || i.proveedor}</td>
                  <td>{fmtMoney(i.monto, i.moneda)}</td>
                  <td>{fmtMoney(i.saldo, i.moneda)}</td>
                  <td>{i.fechaVencimiento?.slice ? i.fechaVencimiento.slice(0,10) : ''}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span>{i.facturaProveedor?.numero || '-'}</span>
                      {i.facturaProveedor?.fecha && <span className="muted" style={{ fontSize:12 }}>{String(i.facturaProveedor.fecha).slice(0,10)}</span>}
                      {i.facturaProveedor?.tcUsado != null && (
                        <span className="muted" style={{ fontSize:11 }}>
                          TC: {Number(i.facturaProveedor.tcUsado).toFixed(4)}
                          {i.facturaProveedor.tcFuente ? ` · ${i.facturaProveedor.tcFuente}` : ''}
                          {i.facturaProveedor.tcFecha ? ` · ${String(i.facturaProveedor.tcFecha).slice(0,10)}` : ''}
                        </span>
                      )}
                      {(i.facturaProveedor?.numero || i.facturaProveedor?.adjuntoUrl) && (
                        <span style={{ background:'#d4edda', color:'#155724', padding:'2px 6px', borderRadius:10, fontSize:11 }}>✓ Factura</span>
                      )}
                      <button className="btn btn--small" disabled={i.estado==='pagado'||i.estado==='anulado'} onClick={()=>{
                        const f = i.facturaProveedor || {};
                        setFacturaProvModal({
                          open:true,
                          cxpId: i._id,
                          numero: f.numero || '',
                          fecha: f.fecha ? String(f.fecha).slice(0,10) : '',
                          adjuntoUrl: f.adjuntoUrl || '',
                          observaciones: f.observaciones || '',
                          tcUsado: f.tcUsado != null ? String(f.tcUsado) : '',
                          tcFuente: f.tcFuente || '',
                          tcFecha: f.tcFecha ? String(f.tcFecha).slice(0,10) : '',
                          archivo: null,
                          uploading: false,
                          progress: 0,
                          errorMsg: ''
                        });
                      }}>Factura</button>
                    </div>
                  </td>
                  <td>{i.estado}</td>
                  <td>
                    <button className="btn btn--small" onClick={()=> pagarCxp(i._id)} disabled={i.estado==='pagado'||i.estado==='anulado'}>Pagar</button>
                    <button className="btn btn--danger btn--small" onClick={()=> anularCxp(i._id)} disabled={i.estado==='pagado'||i.estado==='anulado'}>Anular</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {facturaProvModal.open && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__content">
              <div className="modal__header">
                <div className="modal__title">Factura de Proveedor</div>
                <button className="btn btn--secondary" onClick={()=> setFacturaProvModal({ open:false, cxpId:'', numero:'', fecha:'', adjuntoUrl:'', observaciones:'', tcUsado:'', tcFuente:'', tcFecha:'', archivo:null, uploading:false, progress:0, errorMsg:'' })}>Cerrar</button>
              </div>
              <div>
                <label>Número</label>
                <input value={facturaProvModal.numero} onChange={e=> setFacturaProvModal({ ...facturaProvModal, numero: e.target.value })} />
                <label>Fecha</label>
                <input type="date" value={facturaProvModal.fecha} onChange={e=> setFacturaProvModal({ ...facturaProvModal, fecha: e.target.value })} />
                <label>Adjunto</label>
                {facturaProvModal.adjuntoUrl ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <button type="button" className="btn btn--secondary" onClick={async()=>{
                      try {
                        const r = await fetch(`${FINANZAS_URL}/cxp/${facturaProvModal.cxpId}/factura/adjunto`, { headers: token? { Authorization:`Bearer ${token}` } : {} });
                        if (!r.ok) { alert('No se pudo descargar el adjunto'); return; }
                        const blob = await r.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const ext = (facturaProvModal.adjuntoUrl.split('.').pop()||'file');
                        a.download = `factura_proveedor_${facturaProvModal.cxpId}.${ext}`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch {
                        alert('Error al descargar adjunto');
                      }
                    }}>📎 Descargar adjunto</button>
                    <button type="button" className="btn btn--secondary" onClick={()=> setFacturaProvModal({ ...facturaProvModal, adjuntoUrl:'', archivo:null })}>Quitar</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=> setFacturaProvModal({ ...facturaProvModal, archivo: e.target.files?.[0] || null, errorMsg:'' })} />
                    <button type="button" className="btn" disabled={!facturaProvModal.archivo || facturaProvModal.uploading} onClick={subirAdjuntoFacturaProv}>{facturaProvModal.uploading? `Subiendo… ${facturaProvModal.progress}%`:'Subir'}</button>
                  </div>
                )}
                {facturaProvModal.errorMsg && <div className="panel" style={{ color:'#b23', margin:'6px 0' }}>{facturaProvModal.errorMsg}</div>}
                <label>Observaciones</label>
                <textarea rows="2" value={facturaProvModal.observaciones} onChange={e=> setFacturaProvModal({ ...facturaProvModal, observaciones: e.target.value })} />
                <label>TC usado (opcional)</label>
                <input type="number" step="0.0001" value={facturaProvModal.tcUsado} onChange={e=> setFacturaProvModal({ ...facturaProvModal, tcUsado: e.target.value })} />
                {(facturaProvModal.tcFuente || facturaProvModal.tcFecha) && (
                  <div className="muted" style={{ fontSize:12, marginTop:4 }}>
                    {facturaProvModal.tcFuente && <span>Fuente: {facturaProvModal.tcFuente}</span>}
                    {facturaProvModal.tcFuente && facturaProvModal.tcFecha && ' · '}
                    {facturaProvModal.tcFecha && <span>Fecha TC: {facturaProvModal.tcFecha}</span>}
                  </div>
                )}
              </div>
              <div className="modal__footer">
                <button className="btn btn--primary" onClick={guardarFacturaProv}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        <div className="panel">
          <div className="panel__title">Cuentas por Cobrar</div>
          <form className="row" onSubmit={crearCxc}>
            <select value={cxcForm.clienteId} onChange={e=> setCxcForm({ ...cxcForm, clienteId: e.target.value })} required>
              <option value="">Cliente…</option>
              {clientes.map(c=> (
                <option key={c._id} value={c._id}>{c.nombre}{c.ruc?` (${c.ruc})`:''}</option>
              ))}
            </select>
            <select value={cxcForm.facturaId} onChange={e=> {
              const val = e.target.value;
              const f = facturas.find(x=> x._id === val);
              if (f) {
                // Autocompletar monto y cliente (si se encuentra por pedidos)
                const monto = (f.total != null) ? String(f.total) : cxcForm.monto;
                let clienteId = cxcForm.clienteId;
                const ped = pedidos.find(p=> p._id === f.pedido);
                if (ped && ped.cliente) {
                  clienteId = (ped.cliente._id || ped.cliente);
                } else if (f.cliente) {
                  clienteId = (f.cliente._id || f.cliente);
                }
                setCxcForm(prev => ({ ...prev, facturaId: val, monto, clienteId: clienteId || prev.clienteId }));
              } else {
                setCxcForm(prev => ({ ...prev, facturaId: val }));
              }
            }}>
              <option value="">Factura (opcional)…</option>
              {facturas.filter(f=> f.estado==='emitida').map(f=> (
                <option key={f._id} value={f._id}>{f.numero} - {fmtMoney(f.total, cxcForm.moneda)}</option>
              ))}
            </select>
            <input type="date" value={cxcForm.fechaVencimiento} onChange={e=> setCxcForm({ ...cxcForm, fechaVencimiento: e.target.value })} required />
            <select value={cxcForm.moneda} onChange={e=> {
              const newMon = e.target.value; const oldMon = cxcForm.moneda; const val = Number(cxcForm.monto);
              let newMonto = cxcForm.monto;
              if (tc && Number.isFinite(val) && oldMon !== newMon && val > 0 && tc.referencia) {
                if (oldMon === 'GTQ' && newMon === 'USD') newMonto = (val / Number(tc.referencia)).toFixed(2);
                if (oldMon === 'USD' && newMon === 'GTQ') newMonto = (val * Number(tc.referencia)).toFixed(2);
              }
              setCxcForm({ ...cxcForm, moneda: newMon, monto: String(newMonto) });
            }}><option value="GTQ">GTQ</option><option value="USD">USD</option></select>
            <input type="number" step="0.01" placeholder="Monto" value={cxcForm.monto} onChange={e=> setCxcForm({ ...cxcForm, monto: e.target.value })} required />
            <button className="btn">Crear</button>
          </form>
          <div style={{ marginTop:8 }}>
            <button className="btn btn--secondary" onClick={()=> { loadFinanzas(); loadClientes(); loadFacturas(); }}>Refrescar</button>
          </div>
          <table className="table table--zebra" style={{ marginTop:8 }}>
            <thead><tr><th>Cliente</th><th>Monto</th><th>Saldo</th><th>Vence</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {cxc.map(i => (
                <tr key={i._id}>
                  <td>{i.cliente?.nombre || i.cliente}</td>
                  <td>{fmtMoney(i.monto, i.moneda)}</td>
                  <td>{fmtMoney(i.saldo, i.moneda)}</td>
                  <td>{i.fechaVencimiento?.slice ? i.fechaVencimiento.slice(0,10) : ''}</td>
                  <td>{i.estado}</td>
                  <td>
                    <button className="btn btn--small" onClick={()=> cobrarCxc(i._id)} disabled={i.estado==='cobrado'||i.estado==='anulado'}>Cobrar</button>
                    <button className="btn btn--danger btn--small" onClick={()=> anularCxc(i._id)} disabled={i.estado==='cobrado'||i.estado==='anulado'}>Anular</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (panel === 'ventas') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Ventas y Clientes</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>Usuario: <b>{user.nombre}</b> ({user.rol})</div>

        <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel" style={{ marginBottom:16 }}>
          <div className="panel__title">Identidad Visual</div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'.75rem', opacity:.6, marginBottom:4 }}>Logo actual</div>
              {logoData ? <img src={logoData} alt="Logo" style={{ maxWidth:120, maxHeight:80, objectFit:'contain', border:'1px solid var(--input-border)', padding:4, borderRadius:8 }} /> : <div style={{ width:120, height:80, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', border:'1px dashed var(--input-border)', borderRadius:8 }}>Sin logo</div>}
            </div>
            <div style={{ flex:1, minWidth:220 }}>
              <label style={{ fontSize:'.75rem', opacity:.7 }}>Subir nuevo logo (PNG/JPG ≤ 300KB)</label>
              <input type="file" accept="image/png,image/jpeg" onChange={e=> { const f=e.target.files?.[0]; if(!f) return; if(f.size>300*1024){ alert('Archivo demasiado grande (>300KB)'); return;} handleLogoUpload(f); }} />
              <div style={{ fontSize:'.6rem', opacity:.55, marginTop:4 }}>Se guarda localmente; integración backend de almacenamiento se puede añadir luego.</div>
            </div>
          </div>
        </div>
          <div className="panel__title">👤 Clientes</div>
          <form onSubmit={async(e)=>{
            e.preventDefault();
            setVentasMsg('');
            try{ const r = await fetch(`${VENTAS_URL}/clientes`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(newCliente) });
              const d = await r.json();
              if(r.ok){ setNewCliente({ nombre:'', ruc:'', email:'', telefono:'', direccion:'' }); loadClientes(); setVentasMsg('Cliente creado'); }
              else setVentasMsg(d.error||'Error al crear cliente');
            } catch{ setVentasMsg('Error de conexión'); }
          }} style={{ marginBottom: 12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <input placeholder="Nombre*" value={newCliente.nombre} onChange={e=>setNewCliente({...newCliente, nombre:e.target.value})} required />
              <input placeholder="RUC/NIT" value={newCliente.ruc} onChange={e=>setNewCliente({...newCliente, ruc:e.target.value})} />
              <input placeholder="Email" value={newCliente.email} onChange={e=>setNewCliente({...newCliente, email:e.target.value})} />
              <input placeholder="Teléfono" value={newCliente.telefono} onChange={e=>setNewCliente({...newCliente, telefono:e.target.value})} />
              <input placeholder="Dirección" value={newCliente.direccion} onChange={e=>setNewCliente({...newCliente, direccion:e.target.value})} />
            </div>
            <div style={{ height:8 }} />
            <button className="btn btn--primary">Agregar Cliente</button>
          </form>
          <table className="table table--zebra">
            <thead><tr><th>Nombre</th><th>RUC</th><th>Email</th><th>Teléfono</th></tr></thead>
            <tbody>{clientes.map(c=> (
              <tr key={c._id}><td>{c.nombre}</td><td>{c.ruc||'-'}</td><td>{c.email||'-'}</td><td>{c.telefono||'-'}</td></tr>
            ))}</tbody>
          </table>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">📦 Productos Terminados</div>
          <form onSubmit={async(e)=>{
            e.preventDefault(); setVentasMsg('');
            try{ const r = await fetch(`${VENTAS_URL}/productos`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(newProductoPT) });
              const d = await r.json(); if(r.ok){ setNewProductoPT({ sku:'', nombre:'', unidad:'kg' }); loadProductosPT(); setVentasMsg('Producto creado'); } else setVentasMsg(d.error||'Error al crear producto');
            } catch{ setVentasMsg('Error de conexión'); }
          }} style={{ marginBottom: 12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              <input placeholder="SKU*" value={newProductoPT.sku} onChange={e=>setNewProductoPT({...newProductoPT, sku:e.target.value})} required />
              <input placeholder="Nombre*" value={newProductoPT.nombre} onChange={e=>setNewProductoPT({...newProductoPT, nombre:e.target.value})} required />
              <select value={newProductoPT.unidad} onChange={e=>setNewProductoPT({...newProductoPT, unidad:e.target.value})}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="un">un</option>
              </select>
            </div>
            <div style={{ height:8 }} />
            <button className="btn btn--primary">Agregar Producto</button>
          </form>
          <table className="table table--zebra">
            <thead><tr><th>SKU</th><th>Nombre</th><th>Unidad</th></tr></thead>
            <tbody>{productosPT.map(p=> (<tr key={p._id}><td>{p.sku}</td><td>{p.nombre}</td><td>{p.unidad}</td></tr>))}</tbody>
          </table>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">🧾 Pedidos de Venta</div>
          <form onSubmit={async(e)=>{
            e.preventDefault(); setVentasMsg('');
            try{ const r = await fetch(`${VENTAS_URL}/pedidos`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(newPedido) });
              const d = await r.json(); if(r.ok){ setNewPedido({ cliente:'', items:[{ producto:'', cantidad:1, precio:0 }] }); loadPedidos(); setVentasMsg('Pedido creado'); } else setVentasMsg(d.error||'Error al crear pedido');
            } catch{ setVentasMsg('Error de conexión'); }
          }} style={{ marginBottom: 12 }}>
            <label>Cliente*</label>
            <select value={newPedido.cliente} onChange={e=>setNewPedido({...newPedido, cliente:e.target.value})} required>
              <option value="">Seleccione…</option>
              {clientes.map(c=> <option key={c._id} value={c._id}>{c.nombre}</option>)}
            </select>
            <div style={{ height:8 }} />
            {newPedido.items.map((it,idx)=> (
              <div key={idx} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, marginBottom:8 }}>
                <select value={it.producto} onChange={e=>{ const arr=[...newPedido.items]; arr[idx].producto = e.target.value; setNewPedido({ ...newPedido, items: arr }); }}>
                  <option value="">Producto…</option>
                  {productosPT.map(p=> <option key={p._id} value={p._id}>{p.sku} - {p.nombre}</option>)}
                </select>
                <input type="number" min="1" value={it.cantidad} onChange={e=>{ const arr=[...newPedido.items]; arr[idx].cantidad = Number(e.target.value); setNewPedido({ ...newPedido, items: arr }); }} />
                <input type="number" step="0.01" min="0" value={it.precio} onChange={e=>{ const arr=[...newPedido.items]; arr[idx].precio = Number(e.target.value); setNewPedido({ ...newPedido, items: arr }); }} />
                <button type="button" className="btn btn--secondary" onClick={()=>{ const arr=newPedido.items.filter((_,i)=>i!==idx); setNewPedido({ ...newPedido, items: arr.length? arr : [{ producto:'', cantidad:1, precio:0 }] }); }}>Quitar</button>
              </div>
            ))}
            <button type="button" className="btn btn--secondary" onClick={()=> setNewPedido({ ...newPedido, items:[...newPedido.items, { producto:'', cantidad:1, precio:0 }] })}>Añadir línea</button>
            <div style={{ height:8 }} />
            <button className="btn btn--primary" disabled={!newPedido.cliente || newPedido.items.some(i=> !i.producto || i.cantidad<=0)}>Crear Pedido</button>
          </form>

          <table className="table table--zebra">
            <thead><tr><th>Código</th><th>Cliente</th><th>Items</th><th>Total aprox</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {pedidos.map(p=> (
                <tr key={p._id}>
                  <td>{p.codigo}</td>
                  <td>{p.cliente?.nombre || '-'}</td>
                  <td>{(p.items||[]).length}</td>
                  <td>{(p.total||0).toFixed ? p.total.toFixed(2) : p.total}</td>
                  <td>{p.estado}</td>
                  <td>
                    {p.estado==='borrador' && <button className="btn btn--sm" onClick={async()=>{ await fetch(`${VENTAS_URL}/pedidos/${p._id}/confirmar`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); loadPedidos(); }}>Confirmar</button>}
                    {p.estado==='confirmado' && <button className="btn btn--sm btn--primary" onClick={async()=>{ const r = await fetch(`${VENTAS_URL}/pedidos/${p._id}/despachar`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); if(!r.ok){ const d=await r.json(); setVentasMsg(d.error||'No se pudo despachar'); } loadPedidos(); }}>Despachar</button>}
                    {p.estado!=='despachado' && p.estado!=='cancelado' && <button className="btn btn--sm btn--danger" style={{marginLeft:6}} onClick={async()=>{ await fetch(`${VENTAS_URL}/pedidos/${p._id}/cancelar`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); loadPedidos(); }}>Cancelar</button>}
                    {p.estado==='despachado' && <button className="btn btn--sm" style={{marginLeft:6}} onClick={async()=>{ const r = await fetch(`${VENTAS_URL}/facturas`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify({ pedidoId: p._id }) }); if(!r.ok){ const d=await r.json(); setVentasMsg(d.error||'No se pudo facturar'); } else { loadFacturas(); } }}>Facturar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel__title">📄 Facturas</div>
          <table className="table table--zebra"><thead><tr><th>Número</th><th>Pedido</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {facturas.map(f=> (
                <tr key={f._id}>
                  <td>{f.numero}</td>
                  <td>{f.pedido}</td>
                  <td>{f.total}</td>
                  <td>{f.estado}</td>
                  <td>{f.estado==='emitida' && <button className="btn btn--sm btn--danger" onClick={async()=>{ await fetch(`${VENTAS_URL}/facturas/${f._id}/anular`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); loadFacturas(); }}>Anular</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ventasMsg && <div className="panel" style={{ color: ventasMsg.includes('Error')? '#b23':'#2e7d32' }}>{ventasMsg}</div>}
      </div>
    );
  }

  if (panel === 'calidad') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Control de Calidad</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>Usuario: <b>{user.nombre}</b> ({user.rol})</div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">🔎 QC en Recepciones</div>
          <form onSubmit={async(e)=>{
            e.preventDefault();
            try {
              const payload = {
                recepcion: newQCRecep.recepcion,
                lote: newQCRecep.lote,
                mediciones: {
                  humedad: newQCRecep.mediciones.humedad ? Number(newQCRecep.mediciones.humedad) : undefined,
                  acidez: newQCRecep.mediciones.acidez ? Number(newQCRecep.mediciones.acidez) : undefined,
                  defectos: newQCRecep.mediciones.defectos ? Number(newQCRecep.mediciones.defectos) : undefined,
                },
                resultado: newQCRecep.resultado,
                notas: newQCRecep.notas
              };
              const r = await fetch(`${CALIDAD_URL}/recepciones`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
              if (r.ok) { setNewQCRecep({ recepcion:'', lote:'', mediciones:{ humedad:'', acidez:'', defectos:'' }, resultado:'aprobado', notas:'' }); loadQCRecepciones(); }
            } catch { /* noop */ }
          }}>
            <label>Recepción*</label>
            <select value={newQCRecep.recepcion} onChange={e=> setNewQCRecep({ ...newQCRecep, recepcion: e.target.value })} required>
              <option value="">Seleccione…</option>
              {recepciones.map(r => (
                <option key={r._id} value={r._id}>{r.ordenCompra?.numero} - {new Date(r.fechaRecepcion).toLocaleDateString()}</option>
              ))}
            </select>
            <label>Lote*</label>
            <input value={newQCRecep.lote} onChange={e=> setNewQCRecep({ ...newQCRecep, lote: e.target.value })} required />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              <input type="number" step="0.1" placeholder="Humedad %" value={newQCRecep.mediciones.humedad} onChange={e=> setNewQCRecep({ ...newQCRecep, mediciones:{ ...newQCRecep.mediciones, humedad:e.target.value } })} />
              <input type="number" step="0.1" placeholder="Acidez" value={newQCRecep.mediciones.acidez} onChange={e=> setNewQCRecep({ ...newQCRecep, mediciones:{ ...newQCRecep.mediciones, acidez:e.target.value } })} />
              <input type="number" step="1" placeholder="Defectos" value={newQCRecep.mediciones.defectos} onChange={e=> setNewQCRecep({ ...newQCRecep, mediciones:{ ...newQCRecep.mediciones, defectos:e.target.value } })} />
            </div>
            <label>Resultado*</label>
            <select value={newQCRecep.resultado} onChange={e=> setNewQCRecep({ ...newQCRecep, resultado:e.target.value })}>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
            <label>Notas</label>
            <textarea rows="2" value={newQCRecep.notas} onChange={e=> setNewQCRecep({ ...newQCRecep, notas:e.target.value })} />
            <div style={{ height:8 }} />
            <button className="btn btn--primary">Guardar QC</button>
          </form>
        </div>

        {/* QC Proceso */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">🧪 QC en Proceso</div>
          <form onSubmit={async(e)=>{
            e.preventDefault();
            try {
              const payload = { ...newQCProc };
              const r = await fetch(`${CALIDAD_URL}/proceso`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
              if (r.ok) { setNewQCProc({ op:'', etapa:'Tostado', checklist:[{ nombre:'Parámetros OK', ok:true }], resultado:'aprobado', notas:'' }); loadQCProceso(); }
            } catch { /* noop */ }
          }}>
            <label>Orden de Producción*</label>
            <select value={newQCProc.op} onChange={e=> setNewQCProc({ ...newQCProc, op:e.target.value })} required>
              <option value="">Seleccione…</option>
              {ops.map(op => (
                <option key={op._id} value={op._id}>{op.codigo} - {op.producto}</option>
              ))}
            </select>
            <label>Etapa*</label>
            <select value={newQCProc.etapa} onChange={e=> setNewQCProc({ ...newQCProc, etapa:e.target.value })}>
              <option value="Tostado">Tostado</option>
              <option value="Molido">Molido</option>
              <option value="Empaque">Empaque</option>
            </select>
            <div style={{ margin: '8px 0', fontSize: 12 }} className="muted">Checklist</div>
            {newQCProc.checklist.map((c,idx)=> (
              <div key={idx} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:8, marginBottom:6 }}>
                <input placeholder="Nombre del check" value={c.nombre} onChange={e=>{ const arr=[...newQCProc.checklist]; arr[idx].nombre=e.target.value; setNewQCProc({ ...newQCProc, checklist: arr }); }} />
                <label style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <input type="checkbox" checked={c.ok} onChange={e=>{ const arr=[...newQCProc.checklist]; arr[idx].ok = e.target.checked; setNewQCProc({ ...newQCProc, checklist: arr }); }} /> OK
                </label>
                <button type="button" className="btn btn--secondary" onClick={()=>{ const arr=newQCProc.checklist.filter((_,i)=>i!==idx); setNewQCProc({ ...newQCProc, checklist: arr.length? arr : [{ nombre:'Parámetros OK', ok:true }] }); }}>Quitar</button>
              </div>
            ))}
            <button type="button" className="btn btn--secondary" onClick={()=> setNewQCProc({ ...newQCProc, checklist:[...newQCProc.checklist, { nombre:'', ok:true }] })}>Añadir check</button>
            <div style={{ height:8 }} />
            <label>Resultado*</label>
            <select value={newQCProc.resultado} onChange={e=> setNewQCProc({ ...newQCProc, resultado:e.target.value })}>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
            <label>Notas</label>
            <textarea rows="2" value={newQCProc.notas} onChange={e=> setNewQCProc({ ...newQCProc, notas:e.target.value })} />
            <div style={{ height:8 }} />
            <button className="btn btn--primary">Guardar QC Proceso</button>
          </form>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">📋 Historial QC Proceso</div>
          <table className="table table--zebra">
            <thead><tr><th>Fecha</th><th>OP</th><th>Etapa</th><th>Resultado</th><th>Checklist</th></tr></thead>
            <tbody>
              {qcProceso.map(q => (
                <tr key={q._id}>
                  <td>{q.createdAt ? new Date(q.createdAt).toLocaleString() : '-'}</td>
                  <td>{q.op}</td>
                  <td>{q.etapa}</td>
                  <td>{q.resultado}</td>
                  <td>{(q.checklist||[]).map(i=> `${i.ok?'✅':'❌'} ${i.nombre}`).join(' | ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Conformidades */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">⚠️ No Conformidades</div>
          <form onSubmit={async(e)=>{
            e.preventDefault();
            try {
              const r = await fetch(`${CALIDAD_URL}/nc`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) }, body: JSON.stringify(newNC) });
              if (r.ok) { setNewNC({ recurso:'lote', referencia:'', motivo:'', acciones:'' }); loadNCs(); }
            } catch { /* noop */ }
          }} style={{ marginBottom: 12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div>
                <label>Recurso*</label>
                <select value={newNC.recurso} onChange={e=> setNewNC({ ...newNC, recurso:e.target.value })}>
                  <option value="lote">Lote</option>
                  <option value="op">Orden Producción</option>
                </select>
              </div>
              <div>
                <label>Referencia*</label>
                <input value={newNC.referencia} onChange={e=> setNewNC({ ...newNC, referencia:e.target.value })} placeholder="Código de lote u OP" required />
              </div>
            </div>
            <label>Motivo*</label>
            <input value={newNC.motivo} onChange={e=> setNewNC({ ...newNC, motivo:e.target.value })} required />
            <label>Acciones</label>
            <textarea rows="2" value={newNC.acciones} onChange={e=> setNewNC({ ...newNC, acciones:e.target.value })} />
            <div style={{ height:8 }} />
            <button className="btn btn--primary">Crear NC</button>
          </form>

          <table className="table table--zebra">
            <thead><tr><th>Fecha</th><th>Recurso</th><th>Referencia</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {ncs.map(n => (
                <tr key={n._id}>
                  <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : '-'}</td>
                  <td>{n.recurso}</td>
                  <td>{n.referencia}</td>
                  <td>{n.motivo}</td>
                  <td>{n.estado}</td>
                  <td>
                    {n.estado==='abierta' && (
                      <button className="btn btn--sm btn--secondary" onClick={async()=>{ await fetch(`${CALIDAD_URL}/nc/${n._id}/cerrar`, { method:'POST', headers: token? { Authorization:`Bearer ${token}` } : {} }); loadNCs(); }}>Cerrar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel__title">📋 Historial QC Recepciones</div>
          <table className="table table--zebra">
            <thead><tr><th>Fecha</th><th>Recepción</th><th>Lote</th><th>Resultado</th><th>Mediciones</th></tr></thead>
            <tbody>
              {qcRecepciones.map(q => (
                <tr key={q._id}>
                  <td>{new Date(q.fecha).toLocaleDateString()}</td>
                  <td>{q.recepcion}</td>
                  <td>{q.lote}</td>
                  <td>{q.resultado}</td>
                  <td>{[q.mediciones?.humedad?`Hum:${q.mediciones.humedad}%`:null, q.mediciones?.acidez?`Aci:${q.mediciones.acidez}`:null, q.mediciones?.defectos?`Def:${q.mediciones.defectos}`:null].filter(Boolean).join(' | ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  if (panel === 'reportes') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>Usuario: <b>{user.nombre}</b> ({user.rol})</div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">KPIs de Hoy</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
            <div className="kpi"><div className="kpi__label">Ventas Hoy</div><div className="kpi__value">${kpis.ventasHoy?.toFixed ? kpis.ventasHoy.toFixed(2) : kpis.ventasHoy}</div></div>
            <div className="kpi"><div className="kpi__label">Facturas Hoy</div><div className="kpi__value">{kpis.facturasHoy}</div></div>
            <div className="kpi"><div className="kpi__label">Pedidos Confirmados</div><div className="kpi__value">{kpis.pedidosConfirmados}</div></div>
            <div className="kpi"><div className="kpi__label">Pedidos Despachados (hoy)</div><div className="kpi__value">{kpis.pedidosDespachados}</div></div>
            <div className="kpi"><div className="kpi__label">Stock PT (unidades)</div><div className="kpi__value">{kpis.stockPT}</div></div>
            <div className="kpi"><div className="kpi__label">OPs en proceso</div><div className="kpi__value">{kpis.opsEnProceso}</div></div>
            <div className="kpi"><div className="kpi__label">Lotes Bloqueados</div><div className="kpi__value">{kpis.lotesBloqueados}</div></div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>Ventas diarias</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <label className="muted" style={{ fontSize:12 }}>Días</label>
              <select onChange={(e)=> loadVentasDiarias(Number(e.target.value))} defaultValue={7}>
                <option value={7}>7</option>
                <option value={14}>14</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <BarChart data={ventasDiarias.map(v=>({ label:v.fecha, value:v.total }))} accessor={(d)=>Number(d.value||0)} width={Math.max(420, ventasDiarias.length*28)} />
          </div>
          <table className="table table--zebra">
            <thead><tr><th>Fecha</th><th>Monto</th><th>Facturas</th></tr></thead>
            <tbody>
              {ventasDiarias.map(v => (
                <tr key={v.fecha}><td>{v.fecha}</td><td>{v.total?.toFixed ? v.total.toFixed(2) : v.total}</td><td>{v.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel__title" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>Merma en Producción</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <label className="muted" style={{ fontSize:12 }}>Días</label>
              <select onChange={(e)=> loadMerma(Number(e.target.value))} defaultValue={30}>
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={180}>180</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:24, alignItems:'center', margin:'8px 0 12px' }}>
            <div className="kpi"><div className="kpi__label">OPs cerradas</div><div className="kpi__value">{mermaAgg.cerradas}</div></div>
            <div className="kpi"><div className="kpi__label">Merma total</div><div className="kpi__value">{mermaAgg.merma}</div></div>
          </div>
          <div className="muted" style={{ fontSize:12 }}>Nota: merma agregada sobre OPs cerradas en el rango.</div>
        </div>
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

  if (panel === 'config') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Configuración y Usuarios</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>
          Acceso: {user.nombre} ({user.rol})
        </div>

        <form className="panel" onSubmit={async(e)=>{
          e.preventDefault();
          try { const r = await fetch(`${USERS_URL}/registrar`, { method:'POST', headers:{'Content-Type':'application/json', ...(token? { Authorization: `Bearer ${token}` } : {})}, body: JSON.stringify(newUser) }); if (r.ok) { setNewUser({ nombre:'', email:'', password:'', rol:'operador' }); cargarUsuarios(); } }
          catch (e) { console.warn('No se pudo crear usuario', e); }
        }}>
          <div className="panel__title">Crear usuario</div>
          <label>Nombre</label>
          <input value={newUser.nombre} onChange={e=>setNewUser({...newUser, nombre:e.target.value})} required />
          <label>Usuario/Email</label>
          <input value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} required />
          <label>Contraseña</label>
          <input type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} required />
          <label>Rol</label>
          <select value={newUser.rol} onChange={e=>setNewUser({...newUser, rol:e.target.value})}>
            <option value="operador">Operador</option>
            <option value="it">Soporte IT</option>
            <option value="rrhh">RRHH</option>
            <option value="admin">Administrador</option>
            <option value="auditor">Auditor</option>
          </select>
          <div style={{ height:8 }} />
          <button className="btn btn--primary" type="submit">Crear</button>
        </form>

        <h3>Usuarios</h3>
        <table className="table table--zebra">
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u._id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.rol} onChange={async(e)=>{ await fetch(`${USERS_URL}/${u._id}/rol`, { method:'PATCH', headers:{'Content-Type':'application/json', ...(token? { Authorization: `Bearer ${token}` } : {})}, body: JSON.stringify({ rol:e.target.value }) }); cargarUsuarios(); }}>
                    <option value="operador">Operador</option>
                    <option value="it">Soporte IT</option>
                    <option value="rrhh">RRHH</option>
                    <option value="admin">Administrador</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn--sm btn--secondary" onClick={async()=>{ await fetch(`${RESET_SIMPLE_URL}`, { method:'POST', headers:{'Content-Type':'application/json', ...(token? { Authorization: `Bearer ${token}` } : {})}, body: JSON.stringify({ email: u.email, nuevaPassword: '12345678' }) }); }}>Reset pass</button>
                  <button className="btn btn--sm btn--danger" style={{ marginLeft:6 }} onClick={async()=>{ await fetch(`${USERS_URL}/${u._id}`, { method:'DELETE', headers: token? { Authorization: `Bearer ${token}` } : {} }); cargarUsuarios(); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (panel === 'compras') {
    return (
      <div className="form-container">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Gestión de Compras</h2>
          <button className="btn btn--secondary" onClick={() => setPanel('inicio')}>Volver</button>
        </div>
        <div className="panel muted" style={{ marginBottom: 12 }}>
          Usuario activo: <b>{user.nombre}</b> ({user.rol})
        </div>

        {/* Proveedores */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">🏪 Gestión de Proveedores</div>
          <form onSubmit={async(e) => {
            e.preventDefault();
            try {
              const res = await fetch(`${COMPRAS_URL}/proveedores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newProveedor)
              });
              if (res.ok) {
                setNewProveedor({ nombre: '', ruc: '', contacto: '', telefono: '', direccion: '', email: '' });
                loadProveedores();
                setComprasMsg('Proveedor creado exitosamente');
              } else {
                const data = await res.json();
                setComprasMsg(data.error || 'Error al crear proveedor');
              }
            } catch {
              setComprasMsg('Error de conexión');
            }
          }} style={{ marginBottom: 16 }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>➕ Registrar Nuevo Proveedor</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>🏪 Nombre de la Empresa *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Café Premium SA" 
                    value={newProveedor.nombre} 
                    onChange={e => setNewProveedor({...newProveedor, nombre: e.target.value})} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📋 RUC/NIT</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 20123456789" 
                    value={newProveedor.ruc} 
                    onChange={e => setNewProveedor({...newProveedor, ruc: e.target.value})} 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>👤 Persona de Contacto</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez" 
                    value={newProveedor.contacto} 
                    onChange={e => setNewProveedor({...newProveedor, contacto: e.target.value})} 
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📞 Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="Ej: +51 987654321" 
                    value={newProveedor.telefono} 
                    onChange={e => setNewProveedor({...newProveedor, telefono: e.target.value})} 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📧 Email</label>
                <input 
                  type="email" 
                  placeholder="Ej: ventas@proveedor.com" 
                  value={newProveedor.email} 
                  onChange={e => setNewProveedor({...newProveedor, email: e.target.value})} 
                  style={{ width: '100%' }}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn--primary" 
                style={{ width: '100%', padding: '10px' }}
                disabled={!newProveedor.nombre.trim()}
              >
                🏪 Registrar Proveedor
              </button>
            </div>
          </form>
          
          <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
              <h4 style={{ margin: 0, color: '#495057', display: 'flex', alignItems: 'center' }}>
                📋 Lista de Proveedores Registrados
                <span style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: 12, 
                  fontSize: '12px', 
                  marginLeft: 12 
                }}>
                  {proveedores.length}
                </span>
              </h4>
            </div>
            {proveedores.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
                <div style={{ fontSize: '48px', marginBottom: 16 }}>🏪</div>
                <p>No hay proveedores registrados aún</p>
                <p style={{ fontSize: '14px' }}>Registra tu primer proveedor usando el formulario de arriba</p>
              </div>
            ) : (
              <table className="table table--zebra" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px' }}>🏪 Empresa</th>
                    <th style={{ padding: '12px 16px' }}>📋 RUC</th>
                    <th style={{ padding: '12px 16px' }}>👤 Contacto</th>
                    <th style={{ padding: '12px 16px' }}>📞 Teléfono</th>
                    <th style={{ padding: '12px 16px' }}>📧 Email</th>
                    <th style={{ padding: '12px 16px' }}>✅ Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map(p => (
                    <tr key={p._id}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{p.nombre}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{p.ruc || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{p.contacto || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{p.telefono || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>{p.email || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: p.activo ? '#d4edda' : '#f8d7da',
                          color: p.activo ? '#155724' : '#721c24',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {p.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Órdenes de Compra */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">📋 Órdenes de Compra</div>
          <form onSubmit={async(e) => {
            e.preventDefault();
            try {
              const res = await fetch(`${COMPRAS_URL}/ordenes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newOC)
              });
              if (res.ok) {
                setNewOC({ proveedor: '', items: [{ tipo: 'arabica', cantidad: 100, precioUnitario: 3.0 }] });
                loadOrdenes();
                setComprasMsg('Orden de compra creada exitosamente');
              } else {
                const data = await res.json();
                setComprasMsg(data.error || 'Error al crear orden');
              }
            } catch {
              setComprasMsg('Error de conexión');
            }
          }} style={{ marginBottom: 12 }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 6, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Nueva Orden de Compra</h4>
              <label><strong>Proveedor *</strong></label>
              <select value={newOC.proveedor} onChange={e => setNewOC({...newOC, proveedor: e.target.value})} required style={{ marginBottom: 16 }}>
                <option value="">🏪 Seleccione el proveedor...</option>
                {proveedores.map(p => (
                  <option key={p._id} value={p._id}>🏪 {p.nombre} {p.ruc ? `(${p.ruc})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div style={{ border: '2px dashed #e9ecef', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#495057', display: 'flex', alignItems: 'center' }}>
                📦 Productos a Pedir
                <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: 8, color: '#6c757d' }}>
                  ({newOC.items.length} {newOC.items.length === 1 ? 'producto' : 'productos'})
                </span>
              </h4>
              
              {newOC.items.map((item, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #dee2e6', 
                  borderRadius: 6, 
                  padding: 12, 
                  marginBottom: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 'bold', color: '#495057', marginRight: 8 }}>
                      Producto #{idx + 1}
                    </span>
                    {newOC.items.length > 1 && (
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => {
                        setNewOC({...newOC, items: newOC.items.filter((_, i) => i !== idx)});
                      }} style={{ marginLeft: 'auto' }}>
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>☕ Tipo de Café</label>
                      <select value={item.tipo} onChange={e => {
                        const items = [...newOC.items];
                        items[idx].tipo = e.target.value;
                        setNewOC({...newOC, items});
                      }} style={{ width: '100%' }}>
                        <option value="arabica">☕ Arábica Premium</option>
                        <option value="robusta">💪 Robusta Fuerte</option>
                        <option value="blend">🌟 Blend Especial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>⚖️ Cantidad (kg)</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 100" 
                        value={item.cantidad} 
                        onChange={e => {
                          const items = [...newOC.items];
                          items[idx].cantidad = Number(e.target.value);
                          setNewOC({...newOC, items});
                        }}
                        min="1"
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>💰 Precio/kg ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Ej: 3.50" 
                        value={item.precioUnitario} 
                        onChange={e => {
                          const items = [...newOC.items];
                          items[idx].precioUnitario = Number(e.target.value);
                          setNewOC({...newOC, items});
                        }}
                        min="0.01"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  
                  {item.cantidad > 0 && item.precioUnitario > 0 && (
                    <div style={{ 
                      marginTop: 8, 
                      padding: 8, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 4,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2d5a2d'
                    }}>
                      💵 Subtotal: ${(item.cantidad * item.precioUnitario).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
              
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" className="btn btn--sm" onClick={() => {
                  setNewOC({...newOC, items: [...newOC.items, { tipo: 'arabica', cantidad: 100, precioUnitario: 3.0 }]});
                }} style={{ marginRight: 12 }}>
                  ➕ Agregar Otro Producto
                </button>
                
                {newOC.items.length > 0 && newOC.items.every(i => i.cantidad > 0 && i.precioUnitario > 0) && (
                  <span style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '6px 12px', 
                    borderRadius: 4, 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    💰 Total Orden: ${newOC.items.reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn--primary" 
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={!newOC.proveedor || newOC.items.length === 0}
            >
              📋 Crear Orden de Compra
            </button>
          </form>
          
          
          <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '12px 16px', borderBottom: '1px solid #dee2e6' }}>
              <h4 style={{ margin: 0, color: '#495057', display: 'flex', alignItems: 'center' }}>
                📋 Órdenes de Compra Registradas
                <span style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: 12, 
                  fontSize: '12px', 
                  marginLeft: 12 
                }}>
                  {ordenes.length}
                </span>
              </h4>
            </div>
            {ordenes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
                <div style={{ fontSize: '48px', marginBottom: 16 }}>📋</div>
                <p>No hay órdenes de compra registradas</p>
                <p style={{ fontSize: '14px' }}>Crea tu primera orden usando el formulario de arriba</p>
              </div>
            ) : (
              <table className="table table--zebra" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px' }}>📋 Número</th>
                    <th style={{ padding: '12px 16px' }}>🏪 Proveedor</th>
                    <th style={{ padding: '12px 16px' }}>📦 Productos</th>
                    <th style={{ padding: '12px 16px' }}>💰 Total</th>
                    <th style={{ padding: '12px 16px' }}>📊 Estado</th>
                    <th style={{ padding: '12px 16px' }}>⚡ Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map(oc => (
                    <tr key={oc._id}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{oc.numero}</td>
                      <td style={{ padding: '12px 16px' }}>{oc.proveedor?.nombre}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px' }}>
                          {oc.items?.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: 2 }}>
                              ☕ {item.tipo} - {item.cantidad}kg
                            </div>
                          )) || '0 productos'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#28a745' }}>
                        ${oc.total?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: 
                            oc.estado === 'aprobada' ? '#d4edda' : 
                            oc.estado === 'borrador' ? '#fff3cd' : 
                            oc.estado === 'recibida' ? '#d1ecf1' : '#f8d7da',
                          color: 
                            oc.estado === 'aprobada' ? '#155724' : 
                            oc.estado === 'borrador' ? '#856404' : 
                            oc.estado === 'recibida' ? '#0c5460' : '#721c24',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {oc.estado === 'borrador' && '✏️ Borrador'}
                          {oc.estado === 'aprobada' && '✅ Aprobada'}
                          {oc.estado === 'recibida' && '📦 Recibida'}
                          {oc.estado === 'cancelada' && '❌ Cancelada'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {oc.estado === 'borrador' && (
                          <button className="btn btn--sm btn--primary" onClick={async() => {
                            try {
                              await fetch(`${COMPRAS_URL}/ordenes/${oc._id}/aprobar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ aprobar: true })
                              });
                              loadOrdenes();
                              setComprasMsg('Orden aprobada exitosamente');
                            } catch {
                              setComprasMsg('Error al aprobar orden');
                            }
                          }} style={{ fontSize: '12px' }}>
                            ✅ Aprobar
                          </button>
                        )}
                        {oc.estado === 'aprobada' && (
                          <span style={{ fontSize: '12px', color: '#28a745' }}>
                            ✅ Lista para recepción
                          </span>
                        )}
                        {oc.estado === 'recibida' && (
                          <span style={{ fontSize: '12px', color: '#0c5460' }}>
                            📦 Completada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recepciones */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel__title">📦 Recepción de Lotes de Café</div>
          <form onSubmit={async(e) => {
            e.preventDefault();
            try {
              const res = await fetch(`${COMPRAS_URL}/recepciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newRecepcion)
              });
              if (res.ok) {
                setNewRecepcion({ ordenCompra: '', lotes: [{ tipo: 'arabica', cantidad: 50, costoUnitario: 3.0, lote: '', fechaCosecha: '', humedad: '' }], observaciones: '' });
                loadRecepciones();
                loadOrdenes(); // refresh OC status
                setComprasMsg('Recepción registrada exitosamente - Inventario actualizado');
              } else {
                const data = await res.json();
                setComprasMsg(data.error || 'Error al registrar recepción');
              }
            } catch {
              setComprasMsg('Error de conexión');
            }
          }} style={{ marginBottom: 16 }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#495057' }}>📋 Seleccionar Orden de Compra</h4>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📋 Orden de Compra Aprobada *</label>
              <select 
                value={newRecepcion.ordenCompra} 
                onChange={e => setNewRecepcion({...newRecepcion, ordenCompra: e.target.value})} 
                required
                style={{ width: '100%' }}
              >
                <option value="">📋 Seleccione una orden aprobada...</option>
                {ordenes.filter(oc => oc.estado === 'aprobada').map(oc => (
                  <option key={oc._id} value={oc._id}>
                    📋 {oc.numero} - 🏪 {oc.proveedor?.nombre} (${oc.total?.toFixed(2)})
                  </option>
                ))}
              </select>
              {ordenes.filter(oc => oc.estado === 'aprobada').length === 0 && (
                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#fff3cd', color: '#856404', borderRadius: 4, fontSize: '14px' }}>
                  ⚠️ No hay órdenes de compra aprobadas disponibles para recepción
                </div>
              )}
            </div>
            
            <div style={{ border: '2px dashed #e9ecef', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#495057', display: 'flex', alignItems: 'center' }}>
                📦 Lotes de Café Recibidos
                <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: 8, color: '#6c757d' }}>
                  ({newRecepcion.lotes.length} {newRecepcion.lotes.length === 1 ? 'lote' : 'lotes'})
                </span>
              </h4>
              
              {newRecepcion.lotes.map((lote, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #dee2e6', 
                  borderRadius: 6, 
                  padding: 16, 
                  marginBottom: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 'bold', color: '#495057', marginRight: 8 }}>
                      📦 Lote #{idx + 1}
                    </span>
                    {newRecepcion.lotes.length > 1 && (
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => {
                        setNewRecepcion({...newRecepcion, lotes: newRecepcion.lotes.filter((_, i) => i !== idx)});
                      }} style={{ marginLeft: 'auto' }}>
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>☕ Tipo de Café</label>
                      <select value={lote.tipo} onChange={e => {
                        const lotes = [...newRecepcion.lotes];
                        lotes[idx].tipo = e.target.value;
                        setNewRecepcion({...newRecepcion, lotes});
                      }} style={{ width: '100%' }}>
                        <option value="arabica">☕ Arábica Premium</option>
                        <option value="robusta">💪 Robusta Fuerte</option>
                        <option value="blend">🌟 Blend Especial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>⚖️ Cantidad (kg)</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 50" 
                        value={lote.cantidad} 
                        onChange={e => {
                          const lotes = [...newRecepcion.lotes];
                          lotes[idx].cantidad = Number(e.target.value);
                          setNewRecepcion({...newRecepcion, lotes});
                        }}
                        min="1"
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>💰 Costo/kg ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Ej: 3.50" 
                        value={lote.costoUnitario} 
                        onChange={e => {
                          const lotes = [...newRecepcion.lotes];
                          lotes[idx].costoUnitario = Number(e.target.value);
                          setNewRecepcion({...newRecepcion, lotes});
                        }}
                        min="0.01"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>🏷️ Código de Lote *</label>
                      <input 
                        type="text"
                        placeholder="Ej: LOT-2024-001" 
                        value={lote.lote} 
                        onChange={e => {
                          const lotes = [...newRecepcion.lotes];
                          lotes[idx].lote = e.target.value;
                          setNewRecepcion({...newRecepcion, lotes});
                        }} 
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📅 Fecha Cosecha</label>
                      <input 
                        type="date" 
                        value={lote.fechaCosecha} 
                        onChange={e => {
                          const lotes = [...newRecepcion.lotes];
                          lotes[idx].fechaCosecha = e.target.value;
                          setNewRecepcion({...newRecepcion, lotes});
                        }}
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>💧 Humedad (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Ej: 12.5" 
                        value={lote.humedad} 
                        onChange={e => {
                          const lotes = [...newRecepcion.lotes];
                          lotes[idx].humedad = Number(e.target.value);
                          setNewRecepcion({...newRecepcion, lotes});
                        }}
                        min="0"
                        max="100"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  
                  {lote.cantidad > 0 && lote.costoUnitario > 0 && (
                    <div style={{ 
                      marginTop: 8, 
                      padding: 8, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 4,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2d5a2d'
                    }}>
                      💵 Costo Total Lote: ${(lote.cantidad * lote.costoUnitario).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
              
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" className="btn btn--sm" onClick={() => {
                  setNewRecepcion({...newRecepcion, lotes: [...newRecepcion.lotes, { tipo: 'arabica', cantidad: 50, costoUnitario: 3.0, lote: '', fechaCosecha: '', humedad: '' }]});
                }} style={{ marginRight: 12 }}>
                  ➕ Agregar Otro Lote
                </button>
                
                {newRecepcion.lotes.length > 0 && newRecepcion.lotes.every(l => l.cantidad > 0 && l.costoUnitario > 0) && (
                  <span style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '6px 12px', 
                    borderRadius: 4, 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    💰 Total Recepción: ${newRecepcion.lotes.reduce((sum, l) => sum + (l.cantidad * l.costoUnitario), 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>📝 Observaciones</label>
              <textarea 
                placeholder="Ej: Lotes recibidos en buen estado, calidad excelente..."
                value={newRecepcion.observaciones} 
                onChange={e => setNewRecepcion({...newRecepcion, observaciones: e.target.value})}
                rows="3"
                style={{ width: '100%' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn--primary" 
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={!newRecepcion.ordenCompra || newRecepcion.lotes.length === 0 || !newRecepcion.lotes.every(l => l.lote.trim())}
            >
              📦 Registrar Recepción de Lotes
            </button>
          </form>
          
          <table className="table table--zebra">
            <thead>
              <tr><th>Fecha</th><th>OC</th><th>Proveedor</th><th>Lotes</th><th>Observaciones</th></tr>
            </thead>
            <tbody>
              {recepciones.map(rec => (
                <tr key={rec._id}>
                  <td>{new Date(rec.fechaRecepcion).toLocaleDateString()}</td>
                  <td>{rec.ordenCompra?.numero}</td>
                  <td>{rec.proveedor?.nombre}</td>
                  <td>{rec.lotes?.length || 0}</td>
                  <td>{rec.observaciones || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comprasMsg && <div className="panel" style={{ color: comprasMsg.includes('Error') ? '#b23' : '#4a5' }}>{comprasMsg}</div>}
      </div>
    );
  }
}

export default App;
