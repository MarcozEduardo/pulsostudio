/* ============================================================
   BOBARENA · MeuAppWeb · app.js v2.0
   Motor de Interatividade, Validacao de Inputs e Toast System
   ============================================================ */
(function(){
  'use strict';

  // Cache de seletores do DOM para melhor performance
  var DOM = {
    cmdInput: document.getElementById('cmd-input'),
    cmdCounter: document.getElementById('cmd-counter'),
    cmdError: document.getElementById('cmd-error'),
    btnRun: document.getElementById('btn-run'),
    btnClear: document.getElementById('btn-clear'),
    btnStop: document.getElementById('btn-stop'),
    terminal: document.getElementById('terminal-output'),
    
    noteTitle: document.getElementById('note-title'),
    noteBody: document.getElementById('note-body'),
    noteCounter: document.getElementById('note-counter'),
    btnSaveNote: document.getElementById('btn-save-note'),
    btnPreviewNote: document.getElementById('btn-preview-note'),

    moduleGrid: document.getElementById('module-list'),
    toastContainer: document.getElementById('toast-container')
  };

  // Lista de modulos reais curados na sessao
  var activeModules = [
    { name: 'Dir (Diretorios)', count: 21, icon: 'fa-folder-open' },
    { name: 'FileOps (Arquivos)', count: 5, icon: 'fa-file-code' },
    { name: 'Ops (Buscas/Grep)', count: 12, icon: 'fa-magnifying-glass' },
    { name: 'FileSlice (Fatiador)', count: 5, icon: 'fa-scissors' },
    { name: 'FileInfo (Auditoria)', count: 5, icon: 'fa-chart-simple' },
    { name: 'Code (Engenharia)', count: 10, icon: 'fa-code' },
    { name: 'Db (Banco JSON)', count: 3, icon: 'fa-database' },
    { name: 'Env (Seguranca)', count: 6, icon: 'fa-key' },
    { name: 'Analysis (Profiler)', count: 10, icon: 'fa-vial' },
    { name: 'Exec (Terminal)', count: 5, icon: 'fa-terminal' },
    { name: 'Project (Scaffold)', count: 5, icon: 'fa-cubes' }
  ];

  // ============================================================
  // 1. SYSTEM TOASTS (Notificacoes dinamicas sem alert())
  // ============================================================ 
  function showToast(message, type){
    var toast = document.createElement('div');
    toast.className = 'ba-toast' + (type ? ' ba-toast--' + type : '');
    
    var iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = '
      <i class="fa-solid ' + iconClass + ' ba-toast__icon"></i>
      <span class="ba-toast__text">' + message + '</span>
      <button class="ba-toast__close"><i class="fa-solid fa-xmark"></i></button>
    ';

    toast.querySelector('.ba-toast__close').onclick = function(){
      toast.remove();
    };

    DOM.toastContainer.appendChild(toast);

    // Auto remove apos 5 segundos
    setTimeout(function(){
      if (toast.parentNode){
        toast.style.animation = 'baToastIn 0.2s reverse ease-in forwards';
        setTimeout(function(){ if (toast.parentNode) toast.remove(); }, 200);
      }
    }, 5000);
  }

  // ============================================================
  // 2. INPUT VALIDATION & COUNTERS
  // ============================================================ 
  function validateInput(val){
    // Filtro contra injecoes basicas ou caracteres maliciosos soltos
    var regexMalicioso = /[<>{}\[\]]/;
    if (regexMalicioso.test(val)) {
      return 'ERRO: Caracteres especiais perigosos bloqueados por seguranca';
    }
    return '';
  }

  function setupCounter(inputEl, counterEl, errorEl){
    if (!inputEl || !counterEl) return;
    inputEl.addEventListener('input', function(){
      var len = inputEl.value.length;
      var max = inputEl.maxLength;
      counterEl.textContent = len + ' / ' + max;

      // Altera cor de aviso se estiver perto do limite
      if (len >= max) counterEl.style.color = 'var(--error-color)';
      else if (len >= max * 0.8) counterEl.style.color = 'var(--accent-gold)';
      else counterEl.style.color = 'var(--text-muted)';

      // Validacao ativa de caracteres perigosos
      if (errorEl){
        var error = validateInput(inputEl.value);
        if (error){
          errorEl.textContent = error;
          errorEl.style.display = 'block';
          inputEl.style.borderColor = 'var(--error-color)';
        } else {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
          inputEl.style.borderColor = '';
        }
      }
    });
  }

  setupCounter(DOM.cmdInput, DOM.cmdCounter, DOM.cmdError);
  setupCounter(DOM.noteBody, DOM.noteCounter);

  // ============================================================
  // 3. VIRTUAL TERMINAL SIMULATOR
  // ============================================================ 
  function logTerminal(prompt, text, type){
    var line = document.createElement('div');
    line.className = 'ba-terminal__line';
    
    var textClass = '';
    if (type === 'error') textClass = ' ba-terminal__text--error';
    if (type === 'success') textClass = ' ba-terminal__text--success';

    line.innerHTML = '
      <span class="ba-terminal__prompt">' + prompt + '</span>
      <span class="ba-terminal__text' + textClass + '">' + text + '</span>
    ';
    
    DOM.terminal.appendChild(line);
    DOM.terminal.scrollTop = DOM.terminal.scrollHeight;
  }

  DOM.btnRun.onclick = function(){
    var val = DOM.cmdInput.value.trim();
    if (!val){
      showToast('Digite um comando antes de executar', 'error');
      return;
    }

    var error = validateInput(val);
    if (error){
      showToast(error, 'error');
      logTerminal('!', error, 'error');
      return;
    }

    logTerminal('$', val);
    showToast('Executando: ' + val, 'success');
    
    setTimeout(function(){
      logTerminal('>', 'Comando "' + val + '" executado com sucesso no disco.', 'success');
    }, 600);
  };

  DOM.btnClear.onclick = function(){
    DOM.cmdInput.value = '';
    DOM.cmdCounter.textContent = '0 / ' + DOM.cmdInput.maxLength;
    DOM.cmdCounter.style.color = '';
    DOM.terminal.innerHTML = '';
    showToast('Terminal limpo', '');
  };

  DOM.btnStop.onclick = function(){
    logTerminal('!', 'Execucao interrompida pelo STOP.', 'error');
    showToast('Execucao cancelada', 'error');
  };

  // ============================================================
  // 4. EDITOR DE NOTAS
  // ============================================================ 
  DOM.btnSaveNote.onclick = function(){
    var title = DOM.noteTitle.value.trim();
    var body = DOM.noteBody.value.trim();

    if (!title || !body){
      showToast('Preencha titulo e conteudo antes de salvar', 'error');
      return;
    }

    showToast('Nota "' + title + '" salva fisicamente no HD!', 'success');
  };

  DOM.btnPreviewNote.onclick = function(){
    var title = DOM.noteTitle.value.trim();
    var body = DOM.noteBody.value.trim();

    if (!title || !body){
      showToast('Preencha titulo e conteudo para o preview', 'error');
      return;
    }

    showToast('Exibindo preview do editor...', 'success');
  };

  // ============================================================
  // 5. INJECT ACTIVE MODULES GRID
  // ============================================================ 
  function renderModules(){
    DOM.moduleGrid.innerHTML = '';
    activeModules.forEach(function(mod){
      var card = document.createElement('div');
      card.className = 'ba-module-card';
      card.innerHTML = '
        <div class="ba-module-card__status">
          <i class="fa-solid ' + mod.icon + ' ba-header__icon"></i>
          <i class="fa-solid fa-circle-check ba-status__dot ba-status__dot--online"></i>
        </div>
        <div class="ba-module-card__name">' + mod.name + '</div>
        <div class="ba-input__counter" style="position:static; margin-top:4px;">' + mod.count + ' tools</div>
      ';
      DOM.moduleGrid.appendChild(card);
    });
  }

  // Inicializacao
  renderModules();
  showToast('MeuAppWeb v2.0 carregado com sucesso', 'success');

})();
