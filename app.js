/* ============================================================
   Meu Banco Demo — protótipo de demonstração
   Dados 100% locais e fictícios. Nenhuma operação real é feita.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'meubanco.demo.v2';
  var MASK = 'R$ ••••••';

  /* ----------------------------- Estado ----------------------------- */

  function estadoInicial() {
    /* Valor "quebrado" aleatório na Caixinha, próximo de R$ 10.000,00 */
    var centavos = Math.round((10000 + Math.random() * 1200) * 100);
    if (centavos % 100 === 0) centavos += 47;
    var saldoCaixinha = centavos / 100;

    var deposito1 = arredondar(saldoCaixinha * 0.10);
    var deposito2 = arredondar(saldoCaixinha * 0.40);
    var deposito3 = arredondar(saldoCaixinha - deposito1 - deposito2);

    /* Agência e conta aleatórias (fictícias) */
    var agencia = zeroEsquerda(Math.floor(1 + Math.random() * 9999), 4);
    var conta = String(Math.floor(10000 + Math.random() * 89999)) + '-' + Math.floor(Math.random() * 10);

    /* O crédito inicial é calculado para o extrato fechar exatamente em R$ 0,00 */
    var creditoInicial = arredondar(saldoCaixinha - 1000);

    return {
      usuario: { nome: 'Marina', sobrenome: 'Lemos', agencia: agencia, conta: conta },
      saldoDisponivel: 0,
      ocultarValores: false,
      config: { notificacoes: true, biometria: true },
      caixinha: {
        nome: 'Dinheiro Guardado',
        objetivo: 'Reserva financeira',
        saldo: saldoCaixinha,
        meta: 10000,
        bloqueada: true
      },
      movimentacoes: [
        { id: 1, titulo: 'Crédito de demonstração', desc: 'Entrada inicial na conta', valor: creditoInicial, tipo: 'in', data: '2026-10-01T09:12:00', caixinha: false },
        { id: 2, titulo: 'Pix recebido', desc: 'Maria Souza', valor: 800, tipo: 'in', data: '2026-10-08T11:05:00', caixinha: false },
        { id: 3, titulo: 'Pix recebido', desc: 'Ana Costa', valor: 550, tipo: 'in', data: '2026-10-12T15:40:00', caixinha: false },
        { id: 4, titulo: 'Pagamento de boleto', desc: 'Concessionária de energia', valor: -120, tipo: 'out', data: '2026-10-14T08:15:00', caixinha: false },
        { id: 5, titulo: 'Pix enviado', desc: 'João Lima', valor: -200, tipo: 'out', data: '2026-10-18T16:30:00', caixinha: false },
        { id: 6, titulo: 'Compra no débito', desc: 'Café Aroma', valor: -30, tipo: 'out', data: '2026-10-20T07:50:00', caixinha: false },
        { id: 7, titulo: 'Guardado na Caixinha', desc: 'Dinheiro Guardado', valor: -deposito3, tipo: 'out', data: '2026-10-20T10:02:00', caixinha: true },
        { id: 8, titulo: 'Guardado na Caixinha', desc: 'Dinheiro Guardado', valor: -deposito2, tipo: 'out', data: '2026-10-21T09:20:00', caixinha: true },
        { id: 9, titulo: 'Guardado na Caixinha', desc: 'Dinheiro Guardado', valor: -deposito1, tipo: 'out', data: '2026-10-22T18:45:00', caixinha: true }
      ]
    };
  }

  function arredondar(v) { return Math.round(v * 100) / 100; }

  function zeroEsquerda(n, tamanho) {
    var s = String(n);
    while (s.length < tamanho) s = '0' + s;
    return s;
  }

  var estado = carregar();

  function carregar() {
    var base = estadoInicial();
    try {
      var bruto = window.localStorage.getItem(STORAGE_KEY);
      if (!bruto) return base;
      var salvo = JSON.parse(bruto);
      if (!salvo || typeof salvo !== 'object') return base;
      if (typeof salvo.saldoDisponivel !== 'number') return base;
      if (!salvo.caixinha || typeof salvo.caixinha.saldo !== 'number') return base;
      if (!Array.isArray(salvo.movimentacoes)) salvo.movimentacoes = base.movimentacoes;
      if (!salvo.config || typeof salvo.config !== 'object') salvo.config = base.config;
      if (typeof salvo.caixinha.bloqueada !== 'boolean') salvo.caixinha.bloqueada = true;
      if (typeof salvo.caixinha.meta !== 'number' || salvo.caixinha.meta <= 0) salvo.caixinha.meta = base.caixinha.meta;
      if (typeof salvo.caixinha.nome !== 'string' || !salvo.caixinha.nome) salvo.caixinha.nome = base.caixinha.nome;
      if (typeof salvo.caixinha.objetivo !== 'string' || !salvo.caixinha.objetivo) salvo.caixinha.objetivo = base.caixinha.objetivo;
      return salvo;
    } catch (e) {
      return base;
    }
  }

  function salvar() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (e) {
      /* WebView sem localStorage: o estado permanece apenas em memória */
    }
  }

  /* ---------------------------- Utilidades ---------------------------- */

  var fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function moeda(v) { return fmtBRL.format(Number(v) || 0); }

  function oculto() { return !!estado.ocultarValores; }

  function valorVisivel(v) { return oculto() ? MASK : moeda(v); }

  function qs(sel, raiz) { return (raiz || document).querySelector(sel); }
  function qsa(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  function dinheiro(chave) {
    if (chave === 'saldoDisponivel') return estado.saldoDisponivel;
    if (chave === 'caixinha.saldo') return estado.caixinha.saldo;
    if (chave === 'caixinha.meta') return estado.caixinha.meta;
    if (chave === 'caixinha.disponivel') return estado.caixinha.bloqueada ? 0 : estado.caixinha.saldo;
    if (chave === 'caixinha.bloqueado') return estado.caixinha.bloqueada ? estado.caixinha.saldo : 0;
    if (chave === 'saldoTotal') return estado.saldoDisponivel + estado.caixinha.saldo;
    return 0;
  }

  function percentual() {
    if (estado.caixinha.meta <= 0) return 0;
    var p = (estado.caixinha.saldo / estado.caixinha.meta) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  }

  function dataFormatada(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) d = new Date();
    var agora = new Date();
    var mesmaData = d.getDate() === agora.getDate() && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    var hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (mesmaData) return 'Hoje, ' + hora;
    var data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return data.replace('.', '') + ', ' + hora;
  }

  function agoraISO() { return new Date().toISOString(); }

  /* ------------------------------ Toast ------------------------------ */

  var toastEl = qs('#toast');
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.remove('is-out');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.add('is-out');
      setTimeout(function () { toastEl.hidden = true; }, 220);
    }, 2800);
  }

  /* -------------------------- Navegação ----------------------------- */

  var telas = { home: 'screen-home', dinheiro: 'screen-dinheiro', caixinha: 'screen-caixinha', perfil: 'screen-perfil' };

  function irPara(nome, rolarTopo) {
    if (!telas[nome]) return;
    qsa('.screen').forEach(function (s) { s.classList.remove('is-active'); });
    var alvo = qs('#' + telas[nome]);
    if (alvo) alvo.classList.add('is-active');
    qsa('.tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-nav') === nome);
    });
    if (rolarTopo !== false) {
      var main = qs('#appMain');
      if (main) main.scrollTop = 0;
    }
  }

  /* ----------------------------- Sheets ----------------------------- */

  var backdrop = qs('#backdrop');
  var sheetAberto = null;

  function abrirSheet(id) {
    fecharSheet();
    var s = qs('#' + id);
    if (!s) return;
    backdrop.hidden = false;
    s.hidden = false;
    sheetAberto = s;
  }

  function fecharSheet() {
    if (sheetAberto) sheetAberto.hidden = true;
    sheetAberto = null;
    if (backdrop) backdrop.hidden = true;
  }

  /* ---------------------- Campos de valor monetário ------------------ */

  function mascarar(input) {
    var digitos = String(input.value || '').replace(/\D/g, '');
    if (digitos.length > 12) digitos = digitos.slice(0, 12);
    if (!digitos) { input.value = ''; input.dataset.centavos = '0'; return; }
    var centavos = parseInt(digitos, 10);
    input.dataset.centavos = String(centavos);
    input.value = (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function valorDoCampo(input) { return parseInt(input.dataset.centavos || '0', 10) / 100; }

  function definirCampo(input, valor) {
    if (!input) return;
    var centavos = Math.max(0, Math.round((Number(valor) || 0) * 100));
    input.dataset.centavos = String(centavos);
    input.value = centavos ? (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  }

  /* ---------------------------- Renderização ------------------------- */

  function renderValores() {
    document.body.classList.toggle('is-hidden', oculto());
    qsa('[data-money]').forEach(function (el) {
      el.textContent = valorVisivel(dinheiro(el.getAttribute('data-money')));
      el.classList.toggle('is-blurred', oculto());
    });
  }

  function renderProgresso() {
    var p = percentual();
    qsa('[data-progress="caixinha"]').forEach(function (el) { el.style.width = p + '%'; });
    qsa('[data-progress-label="caixinha"]').forEach(function (el) { el.textContent = (oculto() ? '••' : p) + '%'; });
  }

  function iconePorTipo(tipo) {
    if (tipo === 'in') return '<path d="M12 19V5M5 12l7-7 7 7"/>';
    return '<path d="M12 5v14M5 12l7 7 7-7"/>';
  }

  function itemMov(m) {
    var classeIcone = m.caixinha ? 'list__icon' : (m.tipo === 'in' ? 'list__icon list__icon--in' : 'list__icon list__icon--out');
    var classeValor = 'list__value' + (m.tipo === 'in' ? ' list__value--in' : '');
    var sinal = m.valor > 0 ? '+ ' : '- ';
    var valorTxt = oculto() ? MASK : sinal + moeda(Math.abs(m.valor));
    var sub = m.desc ? m.desc + ' · ' + dataFormatada(m.data) : dataFormatada(m.data);
    var svg = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + iconePorTipo(m.tipo) + '</svg>';

    return '<li class="list__item">' +
      '<span class="' + classeIcone + '">' + svg + '</span>' +
      '<span class="list__main">' +
        '<span class="list__title">' + escapar(m.titulo) + '</span>' +
        '<span class="list__sub">' + escapar(sub) + '</span>' +
      '</span>' +
      '<span class="' + classeValor + '">' + valorTxt + '</span>' +
    '</li>';
  }

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderListas() {
    var todas = estado.movimentacoes.slice().sort(function (a, b) { return new Date(b.data) - new Date(a.data); });
    var caixinha = todas.filter(function (m) { return m.caixinha; });

    var home = qs('#homeMovs');
    if (home) home.innerHTML = todas.slice(0, 4).map(itemMov).join('') || vazioHTML();

    var full = qs('#fullMovs');
    if (full) full.innerHTML = todas.map(itemMov).join('') || vazioHTML();

    var vault = qs('#vaultMovs');
    if (vault) vault.innerHTML = caixinha.map(itemMov).join('') || vazioHTML();
  }

  function vazioHTML() {
    return '<li class="list__empty">Nenhuma movimentação por aqui ainda.</li>';
  }

  function renderCaixinha() {
    var c = estado.caixinha;
    var bloqueada = c.bloqueada;

    var nome = qs('#caixinhaNome'); if (nome) nome.textContent = c.nome;
    var dNome = qs('#dNome'); if (dNome) dNome.textContent = c.nome;
    var dObj = qs('#dObjetivo'); if (dObj) dObj.textContent = c.objetivo;

    var statusTxt = bloqueada ? 'Dinheiro reservado' : 'Disponível para resgate';
    var statusHero = qs('#caixinhaStatus');
    if (statusHero) statusHero.textContent = statusTxt;
    var statusPill = qs('#dStatus');
    if (statusPill) {
      statusPill.textContent = statusTxt;
      statusPill.className = 'pill ' + (bloqueada ? 'pill--warn' : 'pill--ok');
    }

    var badge = qs('#lockBadge');
    if (badge) badge.classList.toggle('is-open', !bloqueada);

    var aviso = qs('.vault__lockrow');
    if (aviso) {
      aviso.classList.toggle('is-open', !bloqueada);
      var txt = aviso.querySelector('span');
      if (txt) txt.textContent = bloqueada ? 'Dinheiro reservado — saque bloqueado' : 'Saque liberado — resgate disponível';
    }

    var toggle = qs('#lockToggle');
    if (toggle) toggle.checked = bloqueada;

    var alerta = qs('[data-resgatar-alert]');
    if (alerta) {
      alerta.className = 'alert' + (bloqueada ? '' : ' is-ok');
      alerta.textContent = bloqueada
        ? 'O bloqueio de saque está ativo. O valor reservado fica indisponível para resgate imediato. Desative o bloqueio em "Segurança" para simular um resgate.'
        : 'Bloqueio desativado nesta simulação. Você pode resgatar o valor reservado para o saldo disponível.';
    }
  }

  function renderConta() {
    var u = estado.usuario || {};
    var txt = 'Ag ' + (u.agencia || '0000') + ' · CC ' + (u.conta || '00000-0');
    qsa('[data-conta]').forEach(function (el) { el.textContent = txt; });
  }

  function renderToggles() {
    var hide = qs('#hideToggle'); if (hide) hide.checked = oculto();
    var notif = qs('#notifToggle'); if (notif) notif.checked = !!estado.config.notificacoes;
    var bio = qs('#bioToggle'); if (bio) bio.checked = !!estado.config.biometria;
  }

  function render() {
    renderValores();
    renderProgresso();
    renderListas();
    renderCaixinha();
    renderConta();
    renderToggles();
  }

  /* ----------------------------- Regras ----------------------------- */

  function registrarMov(mov) {
    mov.id = Date.now();
    mov.data = mov.data || agoraISO();
    estado.movimentacoes.push(mov);
  }

  function guardarDinheiro(valor) {
    valor = Math.round(valor * 100) / 100;
    if (!(valor > 0)) { toast('Informe um valor válido para guardar.'); return false; }
    if (valor > estado.saldoDisponivel) { toast('Saldo disponível insuficiente para guardar esse valor.'); return false; }

    estado.saldoDisponivel -= valor;
    estado.caixinha.saldo += valor;

    registrarMov({
      titulo: 'Guardado na Caixinha',
      desc: estado.caixinha.nome,
      valor: -valor,
      tipo: 'out',
      caixinha: true
    });

    salvar();
    render();
    toast(moeda(valor) + ' guardados na Caixinha.');
    return true;
  }

  function resgatar(valor) {
    valor = Math.round(valor * 100) / 100;

    if (estado.caixinha.bloqueada) {
      toast('Resgate indisponível: o dinheiro está reservado e bloqueado para saque.');
      return false;
    }
    if (!(valor > 0)) { toast('Informe um valor válido para resgatar.'); return false; }
    if (valor > estado.caixinha.saldo) { toast('Valor maior que o saldo da Caixinha.'); return false; }

    estado.caixinha.saldo -= valor;
    estado.saldoDisponivel += valor;

    registrarMov({
      titulo: 'Resgate da Caixinha',
      desc: estado.caixinha.nome,
      valor: valor,
      tipo: 'in',
      caixinha: true
    });

    salvar();
    render();
    toast(moeda(valor) + ' resgatados para o saldo disponível.');
    return true;
  }

  function alternarBloqueio(bloqueada) {
    estado.caixinha.bloqueada = !!bloqueada;
    salvar();
    render();
    toast(bloqueada ? 'Bloqueio de saque ativado (simulação).' : 'Bloqueio de saque desativado (simulação).');
  }

  var resetPendente = 0;

  function restaurar() {
    var agora = Date.now();
    if (agora - resetPendente > 4000) {
      resetPendente = agora;
      toast('Toque novamente em "Restaurar" para confirmar.');
      return;
    }
    resetPendente = 0;
    estado = estadoInicial();
    salvar();
    render();
    irPara('home');
    toast('Dados de demonstração restaurados.');
  }

  /* ----------------------------- Eventos ---------------------------- */

  document.addEventListener('click', function (ev) {
    var nav = ev.target.closest('[data-nav]');
    if (nav) { fecharSheet(); irPara(nav.getAttribute('data-nav')); return; }

    var fechar = ev.target.closest('[data-close]');
    if (fechar) { fecharSheet(); return; }

    var chip = ev.target.closest('[data-chip]');
    if (chip) {
      var campoGuardar = qs('#guardarValor');
      var v = chip.getAttribute('data-chip');
      if (v === 'max') definirCampo(campoGuardar, estado.saldoDisponivel);
      else { var atual = valorDoCampo(campoGuardar); definirCampo(campoGuardar, atual + parseFloat(v)); }
      return;
    }

    var alvo = ev.target.closest('[data-action]');
    if (!alvo) return;
    var acao = alvo.getAttribute('data-action');

    if (acao === 'toggle-hide') {
      estado.ocultarValores = !estado.ocultarValores;
      salvar();
      render();
      toast(estado.ocultarValores ? 'Valores ocultos.' : 'Valores visíveis.');
      return;
    }

    if (acao === 'guardar') {
      definirCampo(qs('#guardarValor'), 0);
      abrirSheet('sheet-guardar');
      return;
    }

    if (acao === 'confirmar-guardar') {
      if (guardarDinheiro(valorDoCampo(qs('#guardarValor')))) fecharSheet();
      return;
    }

    if (acao === 'resgatar') {
      definirCampo(qs('#resgatarValor'), 0);
      abrirSheet('sheet-resgatar');
      return;
    }

    if (acao === 'confirmar-resgatar') {
      var campoR = qs('#resgatarValor');
      var okR = resgatar(valorDoCampo(campoR));
      if (okR) fecharSheet();
      else {
        alvo.classList.add('is-shaking');
        setTimeout(function () { alvo.classList.remove('is-shaking'); }, 420);
      }
      return;
    }

    if (acao === 'meta') {
      definirCampo(qs('#metaValor'), estado.caixinha.meta);
      abrirSheet('sheet-meta');
      return;
    }

    if (acao === 'confirmar-meta') {
      var novaMeta = valorDoCampo(qs('#metaValor'));
      if (!(novaMeta > 0)) { toast('Informe uma meta válida.'); return; }
      estado.caixinha.meta = novaMeta;
      salvar(); render(); fecharSheet();
      toast('Meta atualizada para ' + moeda(novaMeta) + '.');
      return;
    }

    if (acao === 'editar-caixinha') {
      qs('#editNome').value = estado.caixinha.nome;
      qs('#editObjetivo').value = estado.caixinha.objetivo;
      abrirSheet('sheet-editar');
      return;
    }

    if (acao === 'confirmar-editar') {
      var nome = qs('#editNome').value.trim();
      var objetivo = qs('#editObjetivo').value.trim();
      if (!nome || !objetivo) { toast('Preencha nome e objetivo.'); return; }
      estado.caixinha.nome = nome;
      estado.caixinha.objetivo = objetivo;
      salvar(); render(); fecharSheet();
      toast('Caixinha atualizada.');
      return;
    }

    if (acao === 'reset') { restaurar(); return; }

    if (acao === 'simular') { toast(alvo.getAttribute('data-toast') || 'Ação simulada.'); return; }
  });

  if (backdrop) backdrop.addEventListener('click', fecharSheet);

  qsa('.field__input').forEach(function (input) {
    input.addEventListener('input', function () { mascarar(input); });
    input.addEventListener('focus', function () { setTimeout(function () { input.select(); }, 40); });
  });

  var lockToggle = qs('#lockToggle');
  if (lockToggle) lockToggle.addEventListener('change', function () { alternarBloqueio(lockToggle.checked); });

  var hideToggle = qs('#hideToggle');
  if (hideToggle) hideToggle.addEventListener('change', function () {
    estado.ocultarValores = hideToggle.checked;
    salvar(); render();
  });

  var notifToggle = qs('#notifToggle');
  if (notifToggle) notifToggle.addEventListener('change', function () {
    estado.config.notificacoes = notifToggle.checked;
    salvar();
    toast(notifToggle.checked ? 'Notificações ativadas (simulação).' : 'Notificações desativadas.');
  });

  var bioToggle = qs('#bioToggle');
  if (bioToggle) bioToggle.addEventListener('change', function () {
    estado.config.biometria = bioToggle.checked;
    salvar();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') fecharSheet();
  });

  /* ------------------------------ Início ---------------------------- */
  irPara('home', false);
  render();
})();
