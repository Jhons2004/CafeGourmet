/**
 * apiFacade.js
 * Facade completo y asíncrono para toda la API del backend
 * Centraliza todas las llamadas a la API y lógica de negocio
 */

// ========== URLs BASE ==========
const BASE_URL = '/api';
const INVENTARIO_URL = `${BASE_URL}/inventario`;
const PRODUCCION_URL = `${BASE_URL}/produccion`;
const COMPRAS_URL = `${BASE_URL}/compras`;
const VENTAS_URL = `${BASE_URL}/ventas`;
const CALIDAD_URL = `${BASE_URL}/calidad`;
const REPORTES_URL = `${BASE_URL}/reportes`;
const FINANZAS_URL = `${BASE_URL}/finanzas`;
const USUARIOS_URL = `${BASE_URL}/usuario`;
const COMBOS_URL = `${BASE_URL}/combos`;
const TRAZABILIDAD_URL = `${BASE_URL}/trazabilidad`;

// ========== HELPERS ==========
const getToken = () => {
  return localStorage.getItem('token');
};

const isAuthenticated = () => {
  return !!getToken();
};

const clearAuth = () => {
  localStorage.removeItem('token');
  console.log('🔓 Sesión cerrada');
};

const authHeaders = (isMultipart = false) => {
  const headers = isMultipart ? {} : { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    
    // Si es error 401 (no autenticado), limpiar token y mostrar mensaje específico
    if (response.status === 401) {
      const errorMessage = error.error || 'Token inválido o expirado';
      console.warn('🔒 Autenticación requerida:', errorMessage);
      
      // Si el error es por token inválido/expirado, limpiar localStorage
      if (errorMessage.includes('Token') || errorMessage.includes('token')) {
        localStorage.removeItem('token');
        console.warn('⚠️ Token removido. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(`🔒 ${errorMessage}. Por favor, inicia sesión nuevamente.`);
    }
    
    // Si es error 403 (sin permisos), mostrar mensaje específico
    if (response.status === 403) {
      throw new Error(`⛔ ${error.error || 'No tienes permisos para realizar esta acción'}`);
    }
    
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
};

// ========== API FACADE ==========
export const apiFacade = {
  
  // ==================== AUTENTICACIÓN ====================
  auth: {
    login: async (credentials) => {
      const response = await apiRequest(`${USUARIOS_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      // Guardar token automáticamente si el login es exitoso
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('✅ Sesión iniciada correctamente');
      }
      
      return response;
    },
    
    logout: () => {
      clearAuth();
      return Promise.resolve({ success: true });
    },
    
    isAuthenticated,
    
    getMe: async () => {
      return apiRequest(`${USUARIOS_URL}/me`, {
        headers: authHeaders()
      });
    },
    
    forgotPassword: async (email) => {
      return apiRequest(`${USUARIOS_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    },
    
    resetPassword: async (resetToken, newPassword) => {
      return apiRequest(`${USUARIOS_URL}/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaPassword: newPassword })
      });
    },
    
    resetPasswordSimple: async (email, newPassword) => {
      return apiRequest(`${USUARIOS_URL}/reset-password-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nuevaPassword: newPassword })
      });
    }
  },

  // ==================== USUARIOS ====================
  usuarios: {
    listar: async () => {
      return apiRequest(`${USUARIOS_URL}`, {
        headers: authHeaders()
      });
    },
    
    registrar: async (usuario) => {
      return apiRequest(`${USUARIOS_URL}/registrar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(usuario)
      });
    },
    
    actualizarRol: async (id, rol) => {
      return apiRequest(`${USUARIOS_URL}/${id}/rol`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ rol })
      });
    },
    
    actualizar: async (id, datos) => {
      return apiRequest(`${USUARIOS_URL}/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(datos)
      });
    },
    
    eliminar: async (id) => {
      return apiRequest(`${USUARIOS_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
    },
    
    cambiarPassword: async (currentPassword, newPassword) => {
      return apiRequest(`${USUARIOS_URL}/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
    },
    
    getPermisos: async () => {
      return apiRequest(`${USUARIOS_URL}/permisos`, {
        headers: authHeaders()
      });
    },
    
    getPreferencias: async () => {
      return apiRequest(`${USUARIOS_URL}/preferencias`, {
        headers: authHeaders()
      });
    },
    
    actualizarPreferencias: async (preferencias) => {
      return apiRequest(`${USUARIOS_URL}/preferencias`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(preferencias)
      });
    },
    
    subirLogo: async (file) => {
      const formData = new FormData();
      formData.append('logo', file);
      return apiRequest(`${USUARIOS_URL}/logo`, {
        method: 'POST',
        headers: authHeaders(true),
        body: formData
      });
    },
    
    eliminarLogo: async () => {
      return apiRequest(`${USUARIOS_URL}/logo`, {
        method: 'DELETE',
        headers: authHeaders()
      });
    }
  },

  // ==================== INVENTARIO ====================
  inventario: {
    listar: async () => {
      return apiRequest(`${INVENTARIO_URL}/items`, {
        headers: authHeaders()
      });
    },
    
    registrar: async (item) => {
      return apiRequest(`${INVENTARIO_URL}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...item, cantidad: Number(item.cantidad) })
      });
    },
    
    actualizar: async (id, cantidad) => {
      return apiRequest(`${INVENTARIO_URL}/actualizar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id, cantidad: Number(cantidad) })
      });
    },
    
    eliminar: async (id) => {
      return apiRequest(`${INVENTARIO_URL}/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
    },
    
    // Multi-bodega
    bodegas: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/bodegas`, {
          headers: authHeaders()
        });
      },
      crear: async (bodega) => {
        return apiRequest(`${INVENTARIO_URL}/bodegas`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(bodega)
        });
      }
    },
    
    // Ubicaciones
    ubicaciones: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/ubicaciones`, {
          headers: authHeaders()
        });
      },
      crear: async (ubicacion) => {
        return apiRequest(`${INVENTARIO_URL}/ubicaciones`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(ubicacion)
        });
      }
    },
    
    // Movimientos
    movimientos: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/movimientos`, {
          headers: authHeaders()
        });
      },
      registrar: async (movimiento) => {
        return apiRequest(`${INVENTARIO_URL}/movimientos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(movimiento)
        });
      }
    },
    
    // Stock consolidado
    stock: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/stock`, {
          headers: authHeaders()
        });
      }
    },
    
    // Reservas
    reservas: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/reservas`, {
          headers: authHeaders()
        });
      },
      crear: async (reserva) => {
        return apiRequest(`${INVENTARIO_URL}/reservas`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(reserva)
        });
      },
      liberar: async (id) => {
        return apiRequest(`${INVENTARIO_URL}/reservas/${id}/liberar`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    },
    
    // Conteos cíclicos
    conteos: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/conteos`, {
          headers: authHeaders()
        });
      },
      crear: async (conteo) => {
        return apiRequest(`${INVENTARIO_URL}/conteos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(conteo)
        });
      },
      cerrar: async (id) => {
        return apiRequest(`${INVENTARIO_URL}/conteos/${id}/cerrar`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    },
    
    // Stock de Productos Terminados
    stockProductos: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/stock-productos`, {
          headers: authHeaders()
        });
      },
      crear: async (data) => {
        return apiRequest(`${INVENTARIO_URL}/stock-productos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(data)
        });
      }
    },
    
    // Lotes
    lotes: {
      listar: async () => {
        return apiRequest(`${INVENTARIO_URL}/lotes`, {
          headers: authHeaders()
        });
      },
      crear: async (lote) => {
        return apiRequest(`${INVENTARIO_URL}/lotes`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(lote)
        });
      },
      actualizar: async (id, datos) => {
        return apiRequest(`${INVENTARIO_URL}/lotes/${id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(datos)
        });
      }
    },
    
    // Kardex y valorización
    kardex: async (filtros) => {
      const query = new URLSearchParams(filtros).toString();
      return apiRequest(`${INVENTARIO_URL}/kardex${query ? '?' + query : ''}`, {
        headers: authHeaders()
      });
    },
    
    valuacion: async () => {
      return apiRequest(`${INVENTARIO_URL}/valuacion`, {
        headers: authHeaders()
      });
    }
  },

  // ==================== PRODUCCIÓN ====================
  produccion: {
    listar: async (filtros) => {
      const query = new URLSearchParams(filtros || {}).toString();
      return apiRequest(`${PRODUCCION_URL}${query ? '?' + query : ''}`, {
        headers: authHeaders()
      });
    },
    
    crear: async (ordenProduccion) => {
      return apiRequest(`${PRODUCCION_URL}/crear`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(ordenProduccion)
      });
    },
    
    avanzarEtapa: async (id, etapa) => {
      return apiRequest(`${PRODUCCION_URL}/${id}/etapa`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(etapa)
      });
    },
    
    registrarConsumo: async (id, consumo) => {
      return apiRequest(`${PRODUCCION_URL}/${id}/consumo`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(consumo)
      });
    },
    
    cerrar: async (id, datos) => {
      return apiRequest(`${PRODUCCION_URL}/${id}/cerrar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(datos)
      });
    },
    
    consumirBOM: async (id) => {
      return apiRequest(`${PRODUCCION_URL}/${id}/consumir-bom`, {
        method: 'POST',
        headers: authHeaders()
      });
    }
  },

  // ==================== COMPRAS ====================
  compras: {
    proveedores: {
      listar: async () => {
        return apiRequest(`${COMPRAS_URL}/proveedores`, {
          headers: authHeaders()
        });
      },
      crear: async (proveedor) => {
        return apiRequest(`${COMPRAS_URL}/proveedores`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(proveedor)
        });
      },
      actualizar: async (id, datos) => {
        return apiRequest(`${COMPRAS_URL}/proveedores/${id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify(datos)
        });
      }
    },
    
    ordenes: {
      listar: async () => {
        return apiRequest(`${COMPRAS_URL}/ordenes`, {
          headers: authHeaders()
        });
      },
      crear: async (orden) => {
        return apiRequest(`${COMPRAS_URL}/ordenes`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(orden)
        });
      },
      aprobar: async (id, datos) => {
        return apiRequest(`${COMPRAS_URL}/ordenes/${id}/aprobar`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(datos)
        });
      }
    },
    
    recepciones: {
      listar: async () => {
        return apiRequest(`${COMPRAS_URL}/recepciones`, {
          headers: authHeaders()
        });
      },
      crear: async (recepcion) => {
        return apiRequest(`${COMPRAS_URL}/recepciones`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(recepcion)
        });
      }
    }
  },

  // ==================== VENTAS ====================
  ventas: {
    clientes: {
      listar: async () => {
        return apiRequest(`${VENTAS_URL}/clientes`, {
          headers: authHeaders()
        });
      },
      crear: async (cliente) => {
        return apiRequest(`${VENTAS_URL}/clientes`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(cliente)
        });
      },
      actualizar: async (id, datos) => {
        return apiRequest(`${VENTAS_URL}/clientes/${id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify(datos)
        });
      }
    },
    
    productos: {
      listar: async () => {
        return apiRequest(`${VENTAS_URL}/productos`, {
          headers: authHeaders()
        });
      },
      crear: async (producto) => {
        return apiRequest(`${VENTAS_URL}/productos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(producto)
        });
      },
      actualizar: async (id, datos) => {
        return apiRequest(`${VENTAS_URL}/productos/${id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify(datos)
        });
      }
    },
    
    pedidos: {
      listar: async () => {
        return apiRequest(`${VENTAS_URL}/pedidos`, {
          headers: authHeaders()
        });
      },
      crear: async (pedido) => {
        return apiRequest(`${VENTAS_URL}/pedidos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(pedido)
        });
      },
      confirmar: async (id) => {
        return apiRequest(`${VENTAS_URL}/pedidos/${id}/confirmar`, {
          method: 'POST',
          headers: authHeaders()
        });
      },
      despachar: async (id) => {
        return apiRequest(`${VENTAS_URL}/pedidos/${id}/despachar`, {
          method: 'POST',
          headers: authHeaders()
        });
      },
      cancelar: async (id) => {
        return apiRequest(`${VENTAS_URL}/pedidos/${id}/cancelar`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    },
    
    facturas: {
      listar: async () => {
        return apiRequest(`${VENTAS_URL}/facturas`, {
          headers: authHeaders()
        });
      },
      crear: async (factura) => {
        return apiRequest(`${VENTAS_URL}/facturas`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(factura)
        });
      },
      emitir: async (factura) => {
        return apiRequest(`${VENTAS_URL}/facturas`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(factura)
        });
      },
      anular: async (id) => {
        return apiRequest(`${VENTAS_URL}/facturas/${id}/anular`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    }
  },

  // ==================== FINANZAS ====================
  finanzas: {
    cxp: {
      listar: async () => {
        return apiRequest(`${FINANZAS_URL}/cxp`, {
          headers: authHeaders()
        });
      },
      crear: async (cuentaPorPagar) => {
        return apiRequest(`${FINANZAS_URL}/cxp`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(cuentaPorPagar)
        });
      },
      pagar: async (id, pago) => {
        return apiRequest(`${FINANZAS_URL}/cxp/${id}/pago`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(pago)
        });
      },
      anular: async (id) => {
        return apiRequest(`${FINANZAS_URL}/cxp/${id}/anular`, {
          method: 'POST',
          headers: authHeaders()
        });
      },
      actualizarFactura: async (id, factura) => {
        return apiRequest(`${FINANZAS_URL}/cxp/${id}/factura`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(factura)
        });
      },
      subirAdjunto: async (id, file) => {
        const formData = new FormData();
        formData.append('archivo', file);
        return apiRequest(`${FINANZAS_URL}/cxp/${id}/factura/adjunto`, {
          method: 'POST',
          headers: authHeaders(true),
          body: formData
        });
      },
      descargarAdjunto: async (id) => {
        return apiRequest(`${FINANZAS_URL}/cxp/${id}/factura/adjunto`, {
          headers: authHeaders()
        });
      }
    },
    
    cxc: {
      listar: async () => {
        return apiRequest(`${FINANZAS_URL}/cxc`, {
          headers: authHeaders()
        });
      },
      crear: async (cuentaPorCobrar) => {
        return apiRequest(`${FINANZAS_URL}/cxc`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(cuentaPorCobrar)
        });
      },
      cobrar: async (id, cobro) => {
        return apiRequest(`${FINANZAS_URL}/cxc/${id}/cobro`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(cobro)
        });
      },
      anular: async (id) => {
        return apiRequest(`${FINANZAS_URL}/cxc/${id}/anular`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    },
    
    aging: async () => {
      return apiRequest(`${FINANZAS_URL}/aging`, {
        headers: authHeaders()
      });
    },
    
    tipoCambio: async (token, force = false) => {
      const url = `${FINANZAS_URL}/tc${force ? '?force=1' : ''}`;
      return apiRequest(url, {
        headers: authHeaders()
      });
    }
  },

  // ==================== CALIDAD ====================
  calidad: {
    recepciones: {
      listar: async () => {
        return apiRequest(`${CALIDAD_URL}/recepciones`, {
          headers: authHeaders()
        });
      },
      crear: async (recepcion) => {
        return apiRequest(`${CALIDAD_URL}/recepciones`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(recepcion)
        });
      }
    },
    
    proceso: {
      listar: async () => {
        return apiRequest(`${CALIDAD_URL}/proceso`, {
          headers: authHeaders()
        });
      },
      crear: async (control) => {
        return apiRequest(`${CALIDAD_URL}/proceso`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(control)
        });
      }
    },
    
    noConformidades: {
      listar: async () => {
        return apiRequest(`${CALIDAD_URL}/nc`, {
          headers: authHeaders()
        });
      },
      crear: async (nc) => {
        return apiRequest(`${CALIDAD_URL}/nc`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(nc)
        });
      },
      cerrar: async (id) => {
        return apiRequest(`${CALIDAD_URL}/nc/${id}/cerrar`, {
          method: 'POST',
          headers: authHeaders()
        });
      }
    }
  },

  // ==================== REPORTES ====================
  reportes: {
    kpis: async () => {
      return apiRequest(`${REPORTES_URL}/kpis`, {
        headers: authHeaders()
      });
    },
    
    ventasDiarias: async (days = 7) => {
      return apiRequest(`${REPORTES_URL}/ventas-diarias?days=${days}`, {
        headers: authHeaders()
      });
    },
    
    merma: async (days = 30) => {
      return apiRequest(`${REPORTES_URL}/merma?days=${days}`, {
        headers: authHeaders()
      });
    }
  },

  // ==================== TRAZABILIDAD ====================
  trazabilidad: {
    porLote: async (lote) => {
      return apiRequest(`${TRAZABILIDAD_URL}/lote/${encodeURIComponent(lote)}`, {
        headers: authHeaders()
      });
    },
    
    porOP: async (codigo) => {
      return apiRequest(`${TRAZABILIDAD_URL}/op/${encodeURIComponent(codigo)}`, {
        headers: authHeaders()
      });
    }
  },

  // ==================== COMBOS ====================
  combos: {
    crear: async (combo) => {
      return apiRequest(`${COMBOS_URL}/crear`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(combo)
      });
    },
    
    crearPremium: async (combo) => {
      return apiRequest(`${COMBOS_URL}/crear-premium`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ tipoCafe: combo.tipoCafe, cantidad: combo.cantidad })
      });
    }
  },

  // ==================== HEALTH ====================
  health: async () => {
    return apiRequest(`${BASE_URL}/health`);
  },
  
  // ==================== MÉTODOS LEGACY (COMPATIBILIDAD) ====================
  // Estos métodos mantienen compatibilidad con código existente
  fetchGranos: async () => apiFacade.inventario.listar(),
  registrarGrano: async (form) => apiFacade.inventario.registrar(form),
  actualizarGrano: async (id, cantidad) => apiFacade.inventario.actualizar(id, cantidad),
  fetchOps: async () => apiFacade.produccion.listar({}),
  fetchProveedores: async () => apiFacade.compras.proveedores.listar(),
  fetchOrdenes: async () => apiFacade.compras.ordenes.listar(),
  fetchRecepciones: async () => apiFacade.compras.recepciones.listar(),
  fetchClientes: async () => apiFacade.ventas.clientes.listar(),
  fetchProductosPT: async () => apiFacade.ventas.productos.listar(),
  fetchPedidos: async () => apiFacade.ventas.pedidos.listar(),
  fetchFacturas: async () => apiFacade.ventas.facturas.listar(),
  fetchQCRecepciones: async () => apiFacade.calidad.recepciones.listar(),
  fetchQCProceso: async () => apiFacade.calidad.proceso.listar(),
  fetchNCs: async () => apiFacade.calidad.noConformidades.listar(),
  fetchKpis: async () => apiFacade.reportes.kpis(),
  fetchVentasDiarias: async (token, days) => apiFacade.reportes.ventasDiarias(days),
  fetchMerma: async (token, days) => apiFacade.reportes.merma(days),
  getFinanzas: async () => {
    const [cxp, cxc] = await Promise.all([
      apiFacade.finanzas.cxp.listar(),
      apiFacade.finanzas.cxc.listar()
    ]);
    return { cxp, cxc };
  },
  addFinanza: async (finanza) => {
    if (finanza.tipo === 'cxp') {
      return apiFacade.finanzas.cxp.crear(finanza);
    } else {
      return apiFacade.finanzas.cxc.crear(finanza);
    }
  },
  fetchAging: async () => apiFacade.finanzas.aging(),
  fetchTC: async (token, force) => apiFacade.finanzas.tipoCambio(token, force),
  crearCombo: async (comboForm) => apiFacade.combos.crear(comboForm),
  crearComboPremium: async (comboForm) => apiFacade.combos.crearPremium(comboForm),
  getUsuarios: async () => apiFacade.usuarios.listar(),
  addUsuario: async (usuario) => apiFacade.usuarios.registrar(usuario),
  getMe: async () => apiFacade.auth.getMe(),
  login: async (login) => apiFacade.auth.login(login),
  resetPassword: async (changeData) => apiFacade.auth.resetPasswordSimple(changeData.email, changeData.nuevaPassword),
  healthCheck: async () => apiFacade.health()
};

// Exportación por defecto
export default apiFacade;
