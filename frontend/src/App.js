import React, { useEffect, useState } from 'react';
import api from './services/api';
import Login from './login';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Droplets, Wind, Settings, MapPin, LogOut, Activity, 
  Wifi, Github, Linkedin, Server, Info, ShieldCheck, ChevronDown, ChevronUp, FileText, Code, BookOpen 
} from 'lucide-react';
import GraficoHistorico from './components/GraficoHistorico';

function App() {
  const [logado, setLogado] = useState(false);
  const [dados, setDados] = useState([]);
  const [comodoAtivo, setComodoAtivo] = useState('Quarto');
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [limiarUmidade, setLimiarUmidade] = useState(60);
  const [limiarGas, setLimiarGas] = useState(350);

  const buscarDados = async () => {
    try {
      const resposta = await api.get('/dados');
      setDados(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    if (logado) {
      buscarDados();
      const timer = setInterval(buscarDados, 5000);
      return () => clearInterval(timer);
    }
  }, [logado]);

  const enviarConfig = async (tipo, valor) => {
    try {
      await api.post('/config', { tipo, valor: parseFloat(valor) });
      alert(`Configuração enviada! ${tipo} ajustado para ${valor}`);
    } catch (error) {
      console.error(error);
    }
  };

  const simularExportacao = () => {
    if (dados.length === 0) {
      alert("Sem dados para exportar no momento.");
      return;
    }
    alert(`📥 Iniciando download do relatório: relatorio_${comodoAtivo.toLowerCase()}.csv\n\nTotal de registros: ${dados.length}\nStatus: Sucesso!`);
  };

  const getStatus = (valor, limiar) => {
    if (valor === '--') return { texto: '--', corBadge: 'bg-secondary', corBarra: 'bg-secondary' };
    const v = parseFloat(valor);
    const l = parseFloat(limiar);
    if (v >= l) return { texto: 'RUIM', corBadge: 'bg-danger text-white', corBarra: 'bg-danger' };
    else if (v >= (l * 0.8)) return { texto: 'BOM', corBadge: 'bg-warning text-dark', corBarra: 'bg-warning' };
    else return { texto: 'ÓTIMO', corBadge: 'bg-success text-white', corBarra: 'bg-success' };
  };

  const dadosFiltrados = dados.filter(d => d.localizacao === comodoAtivo);
  const ultimaUmidade = dadosFiltrados.find(d => d.tipo === 'humidade')?.valor || '--';
  const ultimoGas = dadosFiltrados.find(d => d.tipo === 'gas')?.valor || '--';

  const statusUmid = getStatus(ultimaUmidade, limiarUmidade);
  const statusGas = getStatus(ultimoGas, limiarGas);

  const getSliderStyle = (valor, max) => {
    const porcentagem = (valor / max) * 100;
    return {
      background: `linear-gradient(to right, #0d6efd 0%, #0d6efd ${porcentagem}%, #dee2e6 ${porcentagem}%, #dee2e6 100%)`
    };
  };

  if (!logado) {
    return <Login aoLogar={() => setLogado(true)} />;
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <style>
        {`
          .custom-range { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 5px; outline: none; }
          .custom-range::-webkit-slider-runnable-track { background: transparent !important; height: 8px; }
          .custom-range::-moz-range-track { background: transparent !important; height: 8px; }
          .custom-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #0d6efd; cursor: pointer; margin-top: -6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        `}
      </style>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center" href="/">
            <div className="bg-white text-primary rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{width:32, height:32}}>
               <ShieldCheck size={20} />
            </div>
            MofoBot <span className="fw-light ms-1 opacity-75">Sense</span>
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-white text-primary d-none d-md-block"><Wifi size={12} className="me-1" /> Online</span>
            <button className="btn btn-sm btn-outline-light border-0" onClick={() => setLogado(false)}><LogOut size={18} className="me-1"/> Sair</button>
          </div>
        </div>
      </nav>

      <main className="container py-4 flex-grow-1">
        
        {/* SELETOR DE CÔMODOS */}
        <div className="row justify-content-center mb-5">
          <div className="col-auto">
            <div className="nav nav-pills bg-white shadow-sm p-1 rounded-pill">
              {['Quarto', 'Sala', 'Escritório'].map(local => (
                <button 
                  key={local}
                  className={`nav-link rounded-pill px-4 fw-bold small ${comodoAtivo === local ? 'active bg-primary' : 'text-muted'}`}
                  onClick={() => setComodoAtivo(local)}
                >
                  <MapPin size={14} className="me-1 mb-1" /> {local}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* CARDS DE STATUS (COM TOOLTIPS NOS TÍTULOS E ÍCONES) */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3 h-100">
              
              {/* CARD UMIDADE */}
              <div className="card border-0 shadow-sm overflow-hidden" title="Leitura em tempo real do sensor de Umidade">
                <div className="card-body p-4 position-relative">
                  <div className="position-absolute top-0 end-0 p-3 opacity-10" title="Ícone: Gotas representando umidade">
                    <Droplets size={80} className="text-primary" />
                  </div>
                  <h6 className="text-uppercase text-muted fw-bold small ls-1" title="Sensor DHT11: Mede a quantidade de vapor d'água no ar">
                    Umidade do Ar <Info size={10} className="ms-1 d-inline"/>
                  </h6>
                  <div className="d-flex align-items-baseline mt-2">
                    <h1 className="display-4 fw-bold mb-0 text-dark">{ultimaUmidade}</h1>
                    <span className="fs-4 text-muted ms-1">%</span>
                  </div>
                  <div className={`mt-3 badge ${statusUmid.corBadge} px-3 py-2 rounded-pill shadow-sm`} title="Nível de risco calculado">
                    Status: <strong>{statusUmid.texto}</strong>
                  </div>
                </div>
                <div className="progress" style={{height: '8px', borderRadius: 0}}>
                   <div className={`progress-bar ${statusUmid.corBarra}`} role="progressbar" style={{width: `${ultimaUmidade}%`, transition: 'width 0.5s, background-color 0.5s'}}></div>
                </div>
              </div>

              {/* CARD GÁS */}
              <div className="card border-0 shadow-sm overflow-hidden" title="Leitura em tempo real da Qualidade do Ar">
                <div className="card-body p-4 position-relative">
                   <div className="position-absolute top-0 end-0 p-3 opacity-10" title="Ícone: Vento representando circulação de ar">
                    <Wind size={80} className="text-warning" />
                  </div>
                  <h6 className="text-uppercase text-muted fw-bold small ls-1" title="Sensor MQ-2: Detecta concentração de CO2 e fumaça em PPM (Partes por Milhão)">
                    Qualidade do Ar <Info size={10} className="ms-1 d-inline"/>
                  </h6>
                  <div className="d-flex align-items-baseline mt-2">
                    <h1 className="display-4 fw-bold mb-0 text-dark">{ultimoGas}</h1>
                    <span className="fs-4 text-muted ms-1">PPM</span>
                  </div>
                  <div className={`mt-3 badge ${statusGas.corBadge} px-3 py-2 rounded-pill shadow-sm`} title="Nível de risco calculado">
                    Status: <strong>{statusGas.texto}</strong>
                  </div>
                </div>
                 <div className="progress" style={{height: '8px', borderRadius: 0}}>
                   <div className={`progress-bar ${statusGas.corBarra}`} role="progressbar" style={{width: `${Math.min(ultimoGas/10, 100)}%`, transition: 'width 0.5s, background-color 0.5s'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary" title="Gráficos de evolução temporal"><Activity className="me-2" />Análise em Tempo Real</h5>
                <span className="badge bg-light text-muted border" title="Mostra os últimos 50 pontos de dados recebidos (aprox. 4 minutos)" style={{cursor: 'help'}}>
                  Histórico: 50pts <Info size={10} className="ms-1"/>
                </span>
              </div>
              <div className="card-body">
                {dadosFiltrados.length > 0 ? (
                  <GraficoHistorico dados={dadosFiltrados} limiarUmidade={limiarUmidade} limiarGas={limiarGas} />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">
                    <Wifi size={48} className="mb-2" />
                    <p>Conectando ao sensor...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PAINEL CONFIGURAÇÃO (TOOLTIPS NOS SLIDERS) */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded overflow-hidden">
                <button 
                  className="card-header bg-white fw-bold text-dark py-3 border-0 w-100 text-start d-flex justify-content-between align-items-center"
                  onClick={() => setMostrarConfig(!mostrarConfig)}
                  style={{cursor: 'pointer', background: 'none'}}
                  title="Clique para expandir/recolher as configurações"
                >
                  <span><Settings className="me-2 text-muted" size={18} /> PAINEL DE CONTROLE E CALIBRAGEM</span>
                  {mostrarConfig ? <ChevronUp size={20} className="text-muted"/> : <ChevronDown size={20} className="text-muted"/>}
                </button>
                
                {mostrarConfig && (
                  <div className="card-body bg-light border-top">
                    <div className="row g-5 p-2">
                      <div className="col-md-6 border-end border-muted border-opacity-10">
                        <label className="fw-bold text-muted small mb-3 d-block" title="Ajuste o valor máximo aceitável de umidade antes de disparar o alerta">
                          CALIBRAR UMIDADE (%) <Info size={10} className="ms-1 d-inline"/>
                        </label>
                        <input 
                          type="range" className="form-range custom-range" 
                          min="0" max="100" value={limiarUmidade} 
                          onChange={(e) => setLimiarUmidade(e.target.value)}
                          style={getSliderStyle(limiarUmidade, 100)} 
                          title={`Arraste para ajustar. Limiar atual: ${limiarUmidade}%`}
                        />
                        <div className="d-flex justify-content-between align-items-center mt-2">
                           <span className="h4 mb-0 fw-bold text-primary">{limiarUmidade}%</span>
                           <button className="btn btn-sm btn-primary rounded-pill px-4" onClick={() => enviarConfig('umidade', limiarUmidade)} title="Salvar novo limite de umidade">Aplicar</button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="fw-bold text-muted small mb-3 d-block" title="Ajuste a sensibilidade do sensor de gás. Valores menores detectam perigo mais cedo.">
                          CALIBRAR CO2 (PPM) <Info size={10} className="ms-1 d-inline"/>
                        </label>
                         <input 
                           type="range" className="form-range custom-range" 
                           min="0" max="1000" step="10" value={limiarGas} 
                           onChange={(e) => setLimiarGas(e.target.value)} 
                           style={getSliderStyle(limiarGas, 1000)} 
                           title={`Arraste para ajustar. Limiar atual: ${limiarGas} PPM`}
                         />
                        <div className="d-flex justify-content-between align-items-center mt-2">
                           <span className="h4 mb-0 fw-bold text-warning">{limiarGas}</span>
                           <button className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-4" onClick={() => enviarConfig('gas', limiarGas)} title="Salvar novo limite de gás">Aplicar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="fw-bold text-primary mb-3">MofoBot Sense</h5>
              <p className="small text-muted mb-3">Sistema IoT avançado para monitoramento e prevenção de fungos.</p>
              <div className="d-flex gap-2"><span className="badge bg-secondary"><Server size={10} className="me-1"/> v1.0.0</span><span className="badge bg-success"><Wifi size={10} className="me-1"/> System OK</span></div>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold text-white mb-3">Ações Rápidas</h6>
              <ul className="list-unstyled small text-muted">
                <li className="mb-2"><button onClick={simularExportacao} className="btn btn-link text-decoration-none text-muted p-0 hover-white" style={{fontSize: 'inherit'}} title="Baixar histórico em CSV"><FileText size={14} className="me-2"/>Exportar Relatório (CSV)</button></li>
                <li className="mb-2"><a href="https://github.com/Sostenes-Maciel" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted hover-white"><Code size={14} className="me-2"/>Código Fonte (GitHub)</a></li>
                <li className="mb-2"><a href="https://github.com/Sostenes-Maciel" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted hover-white"><BookOpen size={14} className="me-2"/>Documentação</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold text-white mb-3">Desenvolvedor</h6>
              <div className="d-flex gap-3 mb-3">
                <a href="https://github.com/Sostenes-Maciel" target="_blank" rel="noopener noreferrer" className="text-white opacity-50 hover-opacity-100"><Github size={24} /></a>
                <a href="https://www.linkedin.com/in/sóstenesmaciel" target="_blank" rel="noopener noreferrer" className="text-white opacity-50 hover-opacity-100"><Linkedin size={24} /></a>
              </div>
              <p className="small text-muted">&copy; 2024 Sóstenes Maciel. Todos os direitos reservados.</p>
            </div>
          </div>
          <hr className="border-secondary opacity-25 my-4" />
          <div className="text-center small text-muted opacity-50"><Info size={12} className="me-1 mb-1"/> Projeto Acadêmico - Análise e Desenvolvimento de Sistemas</div>
        </div>
      </footer>
    </div>
  );
}

export default App;