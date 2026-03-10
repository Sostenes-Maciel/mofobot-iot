import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Mail, ArrowLeft, UserPlus } from 'lucide-react';

function Login({ aoLogar }) {
  // Estados para os campos
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [email, setEmail] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  
  // Estado que controla qual tela aparece: 'login', 'recuperar' ou 'cadastro'
  const [telaAtual, setTelaAtual] = useState('login');

  // Lógica do Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario === 'admin' && senha === '1234') {
      aoLogar();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  // Lógica do Cadastro (Simulação)
  const handleCadastro = (e) => {
    e.preventDefault();
    alert(`Usuário ${nomeCadastro} cadastrado com sucesso! Agora faça login.`);
    setTelaAtual('login'); // Manda o usuário de volta para o login
  };

  // Lógica da Recuperação (Simulação)
  const handleRecuperar = (e) => {
    e.preventDefault();
    alert(`Link enviado para ${email}`);
    setTelaAtual('login');
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark" 
         style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
      
      <div className="card shadow-lg p-4 text-center" style={{ width: '400px', borderRadius: '20px' }}>
        
        {/* CABEÇALHO */}
        <div className="mb-4">
          <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <h2 className="fw-bold mb-1">MofoBot <span className="text-primary">Sense</span></h2>
          <p className="text-muted small">Soluções Inteligentes Contra o Mofo</p>
        </div>
        
        {/* --- TELA 1: LOGIN --- */}
        {telaAtual === 'login' && (
          <form onSubmit={handleLogin} className="text-start fade-in">
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">USUÁRIO</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><User size={18} className="text-secondary"/></span>
                <input type="text" className="form-control border-start-0 bg-light" placeholder="admin"
                  onChange={(e) => setUsuario(e.target.value)} />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">SENHA</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-secondary"/></span>
                <input type="password" className="form-control border-start-0 bg-light" placeholder="••••"
                  onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <button type="button" className="btn btn-link text-decoration-none small p-0"
                onClick={() => setTelaAtual('recuperar')}>Esqueceu a senha?</button>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm mb-3">ACESSAR SISTEMA</button>

            <div className="text-center border-top pt-3">
              <p className="small text-muted mb-1">Não tem uma conta?</p>
              <button type="button" className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => setTelaAtual('cadastro')}>Criar Conta Nova</button>
            </div>
          </form>
        )}

        {/* --- TELA 2: CADASTRO --- */}
        {telaAtual === 'cadastro' && (
          <form onSubmit={handleCadastro} className="text-start fade-in">
            <h5 className="text-center mb-3 text-primary"><UserPlus size={20} className="me-2"/>Criar Conta</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">SEU NOME</label>
              <input type="text" className="form-control bg-light" placeholder="Ex: João Silva"
                onChange={(e) => setNomeCadastro(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">E-MAIL</label>
              <input type="email" className="form-control bg-light" placeholder="email@exemplo.com" required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">SENHA</label>
              <input type="password" className="form-control bg-light" placeholder="Crie uma senha forte" required />
            </div>

            <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm mb-3">CADASTRAR</button>
            
            <button type="button" className="btn btn-light w-100 text-muted"
              onClick={() => setTelaAtual('login')}>
              <ArrowLeft size={16} className="me-2"/> Voltar para Login
            </button>
          </form>
        )}

        {/* --- TELA 3: RECUPERAÇÃO --- */}
        {telaAtual === 'recuperar' && (
          <form onSubmit={handleRecuperar} className="text-start fade-in">
            <div className="alert alert-info small border-0 bg-info bg-opacity-10 text-info">
              Enviaremos um link para redefinir sua senha.
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">E-MAIL</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-secondary"/></span>
                <input type="email" className="form-control border-start-0 bg-light" placeholder="email@exemplo.com"
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm mb-3">ENVIAR LINK</button>
            
            <button type="button" className="btn btn-light w-100 text-muted"
              onClick={() => setTelaAtual('login')}>
              <ArrowLeft size={16} className="me-2"/> Voltar
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;