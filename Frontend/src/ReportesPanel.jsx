// ReportesPanel.jsx
import React, { useState, useEffect } from 'react';
import { apiFacade } from './apiFacade';

// Factory para KPI
function KPIItem({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Composite para lista de KPIs
function KPIList({ kpis }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <KPIItem label="Ventas Hoy" value={kpis.ventasHoy} />
      <KPIItem label="Facturas Hoy" value={kpis.facturasHoy} />
      <KPIItem label="Pedidos Confirmados" value={kpis.pedidosConfirmados} />
      <KPIItem label="Pedidos Despachados" value={kpis.pedidosDespachados} />
      <KPIItem label="Stock PT" value={kpis.stockPT} />
      <KPIItem label="OPs en Proceso" value={kpis.opsEnProceso} />
      <KPIItem label="Lotes Bloqueados" value={kpis.lotesBloqueados} />
    </div>
  );
}

// Factory para gráfico de ventas diarias
function VentasDiariasChart({ ventasDiarias }) {
  if (!ventasDiarias || ventasDiarias.length === 0) return null;
  const max = Math.max(...ventasDiarias.map(v => v.monto));
  return (
    <svg width={420} height={120} style={{ marginBottom: 18 }}>
      <text x="0" y="12" fill="#666" fontSize="11">max: {max.toFixed(2)}</text>
      <line x1="0" y1={102} x2={420} y2={102} stroke="#ddd" />
      {ventasDiarias.map((v, i) => {
        const h = Math.round((v.monto / max) * 80);
        return <rect key={i} x={i * 60 + 10} y={102 - h} width={40} height={h} fill="#4a90e2" rx="2" />;
      })}
    </svg>
  );
}

export function ReportesPanel() {
  const [kpis, setKpis] = useState({ ventasHoy:0, facturasHoy:0, pedidosConfirmados:0, pedidosDespachados:0, stockPT:0, opsEnProceso:0, lotesBloqueados:0 });
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [mermaAgg, setMermaAgg] = useState({ merma:0, cerradas:0 });
  const [msg, setMsg] = useState('');

  // Command para cargar KPIs
  const cargarKpis = React.useCallback(async () => {
    try {
      const data = await apiFacade.reportes.kpis();
      setKpis(data);
    } catch (err) {
      setMsg(`Error al cargar KPIs: ${err.message}`);
    }
  }, []);
  useEffect(() => { cargarKpis(); }, [cargarKpis]);

  // Command para cargar ventas diarias
  const cargarVentasDiarias = React.useCallback(async () => {
    try {
      const data = await apiFacade.reportes.ventasDiarias(7);
      setVentasDiarias(data);
    } catch (err) {
      setMsg(`Error al cargar ventas diarias: ${err.message}`);
    }
  }, []);
  useEffect(() => { cargarVentasDiarias(); }, [cargarVentasDiarias]);

  // Command para cargar merma
  const cargarMerma = React.useCallback(async () => {
    try {
      const data = await apiFacade.reportes.merma(30);
      setMermaAgg(data);
    } catch (err) {
      setMsg(`Error al cargar merma: ${err.message}`);
    }
  }, []);
  useEffect(() => { cargarMerma(); }, [cargarMerma]);

  return (
    <div className="panel" style={{ maxWidth: 700, margin: '0 auto', padding: 16 }}>
      <h2>Reportes</h2>
      {msg && <div className="alert alert--warning" style={{ marginBottom: 12 }}>{msg}</div>}
      <h3>KPIs</h3>
      <KPIList kpis={kpis} />
      <h3>Ventas Diarias</h3>
      <VentasDiariasChart ventasDiarias={ventasDiarias} />
      <h3>Merma</h3>
      <div style={{ marginBottom: 18 }}>
        <div><b>Merma:</b> {mermaAgg.merma}</div>
        <div><b>Cerradas:</b> {mermaAgg.cerradas}</div>
      </div>
    </div>
  );
}
