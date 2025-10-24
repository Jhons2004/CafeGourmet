// Factory para crear componentes de finanzas
export class FinanzasFactory {
  createFinanzaItem(finanza, idx) {
    return (
      <div key={idx} className="finanza-item">
        <span>{finanza.tipo}</span> - <span>{finanza.monto}</span>
      </div>
    );
  }
  createEmptyFinanza() {
    return { tipo: '', monto: 0 };
  }
}
