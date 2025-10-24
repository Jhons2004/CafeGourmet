// Factory para crear componentes de usuario/configuración
export class ConfigFactory {
  createUsuarioItem(usuario, idx) {
    return (
      <div key={idx} className="usuario-item">
        <span>{usuario.nombre}</span> - <span>{usuario.email}</span> - <span>{usuario.rol}</span>
      </div>
    );
  }
  createEmptyUsuario() {
    return { nombre: '', email: '', rol: 'operador' };
  }
}
