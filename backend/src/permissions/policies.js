// Definición centralizada de recursos y acciones
// Acciones estándar: view, create, update, delete, void, pay, collect, upload, download, approve

const resources = {
  FINANZAS_CXP: 'finanzas.cxp',
  FINANZAS_CXC: 'finanzas.cxc',
  FINANZAS_TC: 'finanzas.tc',
  FINANZAS_AGING: 'finanzas.aging',
};

const actions = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VOID: 'void',
  PAY: 'pay',
  COLLECT: 'collect',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  APPROVE: 'approve'
};

// Matriz de permisos por rol
// true = permitido. No listado = denegado.
const matrix = {
  admin: {
    [resources.FINANZAS_CXP]: [actions.VIEW, actions.CREATE, actions.UPDATE, actions.DELETE, actions.VOID, actions.PAY, actions.UPLOAD, actions.DOWNLOAD],
    [resources.FINANZAS_CXC]: [actions.VIEW, actions.CREATE, actions.UPDATE, actions.DELETE, actions.VOID, actions.COLLECT],
    [resources.FINANZAS_TC]: [actions.VIEW],
    [resources.FINANZAS_AGING]: [actions.VIEW]
  },
  it: {
    [resources.FINANZAS_CXP]: [actions.VIEW, actions.CREATE, actions.UPDATE, actions.VOID, actions.PAY, actions.UPLOAD, actions.DOWNLOAD],
    [resources.FINANZAS_CXC]: [actions.VIEW, actions.CREATE, actions.UPDATE, actions.VOID, actions.COLLECT],
    [resources.FINANZAS_TC]: [actions.VIEW],
    [resources.FINANZAS_AGING]: [actions.VIEW]
  },
  operador: {
    [resources.FINANZAS_CXP]: [actions.VIEW, actions.CREATE, actions.UPDATE, actions.UPLOAD], // sin pagar/anular por defecto
    [resources.FINANZAS_CXC]: [actions.VIEW, actions.CREATE, actions.UPDATE],
    [resources.FINANZAS_TC]: [actions.VIEW],
    [resources.FINANZAS_AGING]: [actions.VIEW]
  },
  rrhh: {
    [resources.FINANZAS_CXP]: [actions.VIEW],
    [resources.FINANZAS_CXC]: [actions.VIEW],
    [resources.FINANZAS_TC]: [actions.VIEW],
    [resources.FINANZAS_AGING]: [actions.VIEW]
  },
  auditor: {
    [resources.FINANZAS_CXP]: [actions.VIEW, actions.DOWNLOAD], // lectura + descarga de soporte
    [resources.FINANZAS_CXC]: [actions.VIEW],
    [resources.FINANZAS_TC]: [actions.VIEW],
    [resources.FINANZAS_AGING]: [actions.VIEW]
  }
};

function isAllowed(role, resource, action) {
  if (role === 'admin') return true;
  const allowed = matrix[role]?.[resource] || [];
  return allowed.includes(action);
}

function policyForRole(role) {
  const res = {};
  const m = matrix[role] || {};
  for (const r of Object.values(resources)) {
    res[r] = (m[r] || []).slice();
  }
  return res;
}

module.exports = { resources, actions, matrix, isAllowed, policyForRole };
