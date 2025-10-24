import React, { useState, useEffect } from 'react';
import { apiFacade } from '../apiFacade';

function ConfigPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para formularios
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Formulario nuevo usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador'
  });
  
  // Formulario editar usuario
  const [editUser, setEditUser] = useState({
    nombre: '',
    email: '',
    rol: ''
  });
  
  // Formulario cambiar contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar usuarios usando apiFacade
  const cargarUsuarios = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFacade.usuarios.listar();
      console.log('Usuarios cargados:', data);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarMensaje(`Error al cargar usuarios: ${err.message}`, 'error');
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const mostrarMensaje = (msg, tipo = 'success') => {
    setMensaje({ texto: msg, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  // Crear nuevo usuario usando apiFacade
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (newUser.password.length < 8) {
      mostrarMensaje('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await apiFacade.usuarios.registrar(newUser);
      mostrarMensaje('Usuario creado exitosamente');
      setNewUser({ nombre: '', email: '', password: '', rol: 'operador' });
      setShowAddUser(false);
      cargarUsuarios();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al crear usuario', 'error');
      console.error('Error creando usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Editar usuario usando apiFacade
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiFacade.usuarios.actualizar(selectedUser._id, editUser);
      mostrarMensaje('Usuario actualizado exitosamente');
      setShowEditUser(false);
      setSelectedUser(null);
      cargarUsuarios();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al actualizar usuario', 'error');
      console.error('Error actualizando usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await apiFacade.usuarios.cambiarPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      mostrarMensaje('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setSelectedUser(null);
    } catch (err) {
      mostrarMensaje(err.message || 'Error al cambiar contraseña', 'error');
      console.error('Error cambiando contraseña:', err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario usando apiFacade
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${userName}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await apiFacade.usuarios.eliminar(userId);
      mostrarMensaje('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (err) {
      mostrarMensaje(err.message || 'Error al eliminar usuario', 'error');
      console.error('Error eliminando usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición
  const openEditModal = (usuario) => {
    setSelectedUser(usuario);
    setEditUser({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });
    setShowEditUser(true);
  };

  // Abrir modal de cambio de contraseña
  const openPasswordModal = (usuario) => {
    setSelectedUser(usuario);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(true);
  };

  const getRoleBadgeClass = (rol) => {
    switch(rol) {
      case 'admin': return 'badge--danger';
      case 'auditor': return 'badge--warning';
      case 'operador': return 'badge--info';
      default: return 'badge--info';
    }
  };

  return (
    <div>
      {/* Mensaje de alerta */}
      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'error' ? 'alert--danger' : 'alert--success'}`} style={{ marginBottom: '1.5rem' }}>
          <span>{mensaje.tipo === 'error' ? '❌' : '✅'}</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Panel de Usuarios */}
      <div className="panel">
        <div className="panel__title">👥 Gestión de Usuarios</div>
        
        <div className="toolbar">
          <div>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
              Total de usuarios: <strong>{usuarios.length}</strong>
            </p>
          </div>
          <button 
            className="btn btn--primary"
            onClick={() => setShowAddUser(true)}
            disabled={loading}
          >
            ➕ Agregar Usuario
          </button>
        </div>

        {loading && usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            <div className="loading-skeleton" style={{ height: '50px', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '50px', marginBottom: '1rem' }}></div>
            <div className="loading-skeleton" style={{ height: '50px' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table table--zebra">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <strong>{usuario.nombre}</strong>
                      </div>
                    </td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn--sm btn--secondary"
                          onClick={() => openEditModal(usuario)}
                          title="Editar usuario"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn--sm btn--secondary"
                          onClick={() => openPasswordModal(usuario)}
                          title="Cambiar contraseña"
                        >
                          🔑 Contraseña
                        </button>
                        <button 
                          className="btn btn--sm btn--danger"
                          onClick={() => handleDeleteUser(usuario._id, usuario.nombre)}
                          title="Eliminar usuario"
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
      </div>

      {/* Información sobre roles */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel__title">📋 Roles y Permisos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👑</span> Admin
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              Acceso total al sistema. Puede gestionar usuarios, configuración y todos los módulos.
            </p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📊</span> Auditor
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              Solo lectura. Puede ver reportes y datos pero no modificar información.
            </p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👤</span> Operador
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              Acceso a operaciones diarias. Puede gestionar inventario, producción y ventas.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Agregar Usuario */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>➕ Agregar Nuevo Usuario</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddUser(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <label>Nombre Completo *</label>
              <input 
                type="text"
                value={newUser.nombre}
                onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                required
                placeholder="Ej: Juan Pérez"
              />
              
              <label>Email *</label>
              <input 
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
                placeholder="usuario@cafegourmet.com"
              />
              
              <label>Contraseña *</label>
              <input 
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
              
              <label>Rol *</label>
              <select 
                value={newUser.rol}
                onChange={(e) => setNewUser({...newUser, rol: e.target.value})}
                required
              >
                <option value="operador">Operador</option>
                <option value="auditor">Auditor</option>
                <option value="admin">Admin</option>
              </select>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Creando...' : '✅ Crear Usuario'}
                </button>
                <button 
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowAddUser(false)}
                  style={{ flex: 1 }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Usuario */}
      {showEditUser && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>✏️ Editar Usuario</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditUser(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <label>Nombre Completo *</label>
              <input 
                type="text"
                value={editUser.nombre}
                onChange={(e) => setEditUser({...editUser, nombre: e.target.value})}
                required
              />
              
              <label>Email *</label>
              <input 
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                required
              />
              
              <label>Rol *</label>
              <select 
                value={editUser.rol}
                onChange={(e) => setEditUser({...editUser, rol: e.target.value})}
                required
              >
                <option value="operador">Operador</option>
                <option value="auditor">Auditor</option>
                <option value="admin">Admin</option>
              </select>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Guardando...' : '✅ Guardar Cambios'}
                </button>
                <button 
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowEditUser(false)}
                  style={{ flex: 1 }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Contraseña */}
      {showChangePassword && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>🔑 Cambiar Contraseña</h2>
              <button 
                className="modal-close"
                onClick={() => setShowChangePassword(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={{ 
              background: '#e3f2fd', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #2196f3',
              color: '#1565c0'
            }}>
              <strong>Usuario:</strong> {selectedUser.nombre} ({selectedUser.email})
            </div>
            
            <form onSubmit={handleChangePassword}>
              <label>Contraseña Actual *</label>
              <input 
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
                placeholder="Ingrese la contraseña actual"
              />
              
              <label>Nueva Contraseña *</label>
              <input 
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
              
              <label>Confirmar Nueva Contraseña *</label>
              <input 
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
                minLength={6}
                placeholder="Repita la nueva contraseña"
              />
              
              {passwordForm.newPassword && passwordForm.confirmPassword && 
               passwordForm.newPassword !== passwordForm.confirmPassword && (
                <div className="alert alert--danger" style={{ marginTop: '1rem' }}>
                  ⚠️ Las contraseñas no coinciden
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading || (passwordForm.newPassword !== passwordForm.confirmPassword)}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Cambiando...' : '✅ Cambiar Contraseña'}
                </button>
                <button 
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowChangePassword(false)}
                  style={{ flex: 1 }}
                >
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

export default ConfigPanel;
