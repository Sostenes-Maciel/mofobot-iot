import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ShieldCheck, AlertTriangle, Wind, Droplets, AlertOctagon, Info } from 'lucide-react';

function GraficoHistorico({ dados, limiarUmidade, limiarGas }) {
  
  const dadosFormatados = useMemo(() => {
    return [...dados].reverse().map(dado => ({
      ...dado,
      hora: new Date(dado.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      umidade: dado.tipo === 'humidade' ? dado.valor : null,
      gas: dado.tipo === 'gas' ? dado.valor : null
    }));
  }, [dados]);

  const { offUmidadeFinal, offGasFinal, maxGasChart, percRiscoUmidade, percRiscoGas } = useMemo(() => {
    const offUmidade = (100 - limiarUmidade) / 100;
    const offUmidadeFinal = Math.min(Math.max(offUmidade, 0), 1);

    const maxGasNosDados = Math.max(...dadosFormatados.map(d => d.gas || 0));
    const maxGasChart = Math.max(maxGasNosDados * 1.2, limiarGas * 1.1, 200); 
    const offGas = (maxGasChart - limiarGas) / maxGasChart;
    const offGasFinal = Math.min(Math.max(offGas, 0), 1);

    const listaUmidade = dadosFormatados.filter(d => d.umidade !== null);
    const countUmidadeRuim = listaUmidade.filter(d => d.umidade >= limiarUmidade).length;
    const percRiscoUmidade = listaUmidade.length > 0 ? (countUmidadeRuim / listaUmidade.length) * 100 : 0;

    const listaGas = dadosFormatados.filter(d => d.gas !== null);
    const countGasRuim = listaGas.filter(d => d.gas >= limiarGas).length;
    const percRiscoGas = listaGas.length > 0 ? (countGasRuim / listaGas.length) * 100 : 0;

    return { offUmidadeFinal, offGasFinal, maxGasChart, percRiscoUmidade, percRiscoGas };
  }, [dadosFormatados, limiarUmidade, limiarGas]);

  let conclusao = { titulo: "AMBIENTE SEGURO", msg: "Histórico indica condições favoráveis.", cor: "bg-success" };
  if (percRiscoUmidade > 30 && percRiscoGas > 30) {
    conclusao = { titulo: "PERIGO CRÍTICO", msg: "Combinação de Umidade Alta + Ar Parado persistente.", cor: "bg-danger" };
  } else if (percRiscoUmidade > 30) {
    conclusao = { titulo: "RISCO DE MOFO", msg: "A umidade tem ficado acima do limite frequentemente.", cor: "bg-warning text-dark" };
  } else if (percRiscoGas > 30) {
    conclusao = { titulo: "AR VICIADO", msg: "Pouca renovação de ar detectada no período.", cor: "bg-info text-dark" };
  }

  return (
    <div className="row g-3">
      
      {/* --- COLUNA GRÁFICOS --- */}
      <div className="col-lg-8">
        
        {/* GRÁFICO 1: UMIDADE */}
        <div className="card border-0 mb-3" title="Gráfico temporal: Mostra a variação da umidade relativa (%) nos últimos minutos.">
            <h6 className="text-primary fw-bold ps-2 mb-0 d-flex align-items-center">
              <Droplets size={16} className="me-2"/> Histórico de Umidade 
              <Info size={12} className="ms-2 text-muted opacity-50" />
            </h6>
            <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <AreaChart data={dadosFormatados}>
                <defs>
                    <linearGradient id="gradUmid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={offUmidadeFinal} stopColor="#dc3545" stopOpacity={1} />
                    <stop offset={offUmidadeFinal} stopColor="#0dcaf0" stopOpacity={1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hora" hide />
                <YAxis domain={[0, 100]} unit="%" style={{fontSize: 11}} width={35}/>
                <Tooltip contentStyle={{ backgroundColor: '#212529', color: '#fff' }} animationDuration={100} />
                <ReferenceLine y={limiarUmidade} stroke="#dc3545" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="umidade" stroke="url(#gradUmid)" fill="url(#gradUmid)" fillOpacity={0.4} strokeWidth={3} connectNulls isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* GRÁFICO 2: GÁS */}
        <div className="card border-0" title="Gráfico temporal: Mostra a concentração de partículas (PPM) no ar. Picos indicam má ventilação.">
            <h6 className="text-warning fw-bold ps-2 mb-0 d-flex align-items-center">
              <Wind size={16} className="me-2"/> Histórico de Gás (Ventilação)
              <Info size={12} className="ms-2 text-muted opacity-50" />
            </h6>
            <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <AreaChart data={dadosFormatados}>
                <defs>
                    <linearGradient id="gradGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={offGasFinal} stopColor="#dc3545" stopOpacity={1} />
                    <stop offset={offGasFinal} stopColor="#ffc107" stopOpacity={1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hora" style={{fontSize: 11}} />
                <YAxis domain={[0, maxGasChart]} unit="" style={{fontSize: 11}} width={35}/>
                <Tooltip contentStyle={{ backgroundColor: '#212529', color: '#fff' }} animationDuration={100} />
                <ReferenceLine y={limiarGas} stroke="#dc3545" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="gas" stroke="url(#gradGas)" fill="url(#gradGas)" fillOpacity={0.5} strokeWidth={3} connectNulls isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- COLUNA DIAGNÓSTICO --- */}
      <div className="col-lg-4 d-flex flex-column gap-3 justify-content-center">
        
        {/* Painel Umidade */}
        <div className="border-start border-4 border-primary ps-3 py-2 position-relative" title="Análise estatística: Porcentagem do tempo que a umidade permaneceu acima do limiar seguro.">
            <Info size={14} className="position-absolute top-0 end-0 text-muted m-1" style={{cursor: 'help'}} />
            <small className="text-muted text-uppercase fw-bold">Persistência da Umidade</small>
            <div className="d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fw-bold text-primary">{percRiscoUmidade.toFixed(0)}%</h2>
                {percRiscoUmidade > 30 ? <AlertTriangle className="text-warning"/> : <ShieldCheck className="text-success"/>}
            </div>
            <small className="text-muted" style={{fontSize: '0.75rem'}}>do tempo acima do limite.</small>
        </div>

        {/* Painel Gás */}
        <div className="border-start border-4 border-warning ps-3 py-2 position-relative" title="Análise estatística: Porcentagem do tempo que o ar ficou estagnado (sem renovação) acima do limite.">
            <Info size={14} className="position-absolute top-0 end-0 text-muted m-1" style={{cursor: 'help'}} />
            <small className="text-muted text-uppercase fw-bold">Persistência de Gás</small>
            <div className="d-flex align-items-center justify-content-between">
                <h2 className="mb-0 fw-bold text-warning">{percRiscoGas.toFixed(0)}%</h2>
                {percRiscoGas > 30 ? <AlertTriangle className="text-warning"/> : <ShieldCheck className="text-success"/>}
            </div>
            <small className="text-muted" style={{fontSize: '0.75rem'}}>do tempo acima do limite.</small>
        </div>

        {/* CONCLUSÃO FINAL */}
        <div className={`card ${conclusao.cor} text-white border-0 shadow p-4 text-center mt-2`} title="Veredito da Inteligência Artificial baseado no cruzamento dos dois sensores.">
            <div className="d-flex flex-column align-items-center">
                {conclusao.cor === 'bg-success' ? <ShieldCheck size={40} className="mb-2"/> : <AlertOctagon size={40} className="mb-2"/>}
                <h5 className="fw-bold mb-1">{conclusao.titulo}</h5>
                <p className="mb-0 small opacity-90">{conclusao.msg}</p>
            </div>
        </div>

      </div>
    </div>
  );
}

export default GraficoHistorico;