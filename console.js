(function() {
    'use strict';
    
    // Evita injetar duas vezes se o script recarregar
    if (window.__meuConsole) {
        window.__meuConsole.toggle();
        return;
    }
    
    // === CRIAÇÃO DA INTERFACE ===
    
    const container = document.createElement('div');
    container.id = 'meu-console';
    container.innerHTML = `
        <div class="mc-header">
            <span class="mc-title">🎮 Meu Console</span>
            <div class="mc-buttons">
                <button class="mc-btn mc-min">_</button>
                <button class="mc-btn mc-close">×</button>
            </div>
        </div>
        <div class="mc-body">
            <select class="mc-presets">
                <option value="">-- Scripts salvos --</option>
            </select>
            <textarea class="mc-editor" placeholder="// Cole seu script aqui&#10;console.log('Olá Habblet!');"></textarea>
            <div class="mc-actions">
                <button class="mc-run">▶ Executar</button>
                <button class="mc-save">💾 Salvar</button>
                <button class="mc-clear">🗑 Limpar</button>
            </div>
            <div class="mc-output"></div>
        </div>
    `;
    
    // === ESTILO ===
    
    const style = document.createElement('style');
    style.textContent = `
        #meu-console {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 420px;
            background: #1e1e2e;
            border: 1px solid #45475a;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            font-family: 'Segoe UI', sans-serif;
            color: #cdd6f4;
            z-index: 999999;
            user-select: none;
        }
        #meu-console .mc-header {
            background: #313244;
            padding: 8px 12px;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        #meu-console .mc-title { font-weight: bold; }
        #meu-console .mc-btn {
            background: transparent;
            border: none;
            color: #cdd6f4;
            cursor: pointer;
            font-size: 16px;
            padding: 0 6px;
        }
        #meu-console .mc-btn:hover { color: #f38ba8; }
        #meu-console .mc-body {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        #meu-console.minimized .mc-body { display: none; }
        #meu-console .mc-presets,
        #meu-console .mc-editor {
            background: #11111b;
            border: 1px solid #45475a;
            color: #cdd6f4;
            border-radius: 4px;
            padding: 8px;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            user-select: text;
        }
        #meu-console .mc-editor {
            min-height: 150px;
            resize: vertical;
        }
        #meu-console .mc-actions {
            display: flex;
            gap: 6px;
        }
        #meu-console .mc-actions button {
            flex: 1;
            background: #585b70;
            border: none;
            color: #cdd6f4;
            padding: 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        #meu-console .mc-run { background: #a6e3a1 !important; color: #1e1e2e !important; font-weight: bold; }
        #meu-console .mc-actions button:hover { opacity: 0.85; }
        #meu-console .mc-output {
            background: #11111b;
            border: 1px solid #45475a;
            border-radius: 4px;
            padding: 8px;
            min-height: 50px;
            max-height: 120px;
            overflow-y: auto;
            font-family: 'Consolas', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            user-select: text;
        }
        #meu-console .mc-output .ok { color: #a6e3a1; }
        #meu-console .mc-output .err { color: #f38ba8; }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(container);
    
    // === LÓGICA ===
    
    const editor = container.querySelector('.mc-editor');
    const output = container.querySelector('.mc-output');
    const presets = container.querySelector('.mc-presets');
    const header = container.querySelector('.mc-header');
    
    const log = (msg, tipo = 'ok') => {
        const linha = document.createElement('div');
        linha.className = tipo;
        linha.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        output.appendChild(linha);
        output.scrollTop = output.scrollHeight;
    };
    
    // Executar código
    container.querySelector('.mc-run').addEventListener('click', () => {
        const code = editor.value;
        if (!code.trim()) return;
        try {
            const resultado = eval(code);
            log('✓ Executado' + (resultado !== undefined ? ': ' + resultado : ''), 'ok');
        } catch (err) {
            log('✗ Erro: ' + err.message, 'err');
        }
    });
    
    // Limpar
    container.querySelector('.mc-clear').addEventListener('click', () => {
        editor.value = '';
        output.innerHTML = '';
    });
    
    // Salvar script com nome
    container.querySelector('.mc-save').addEventListener('click', () => {
        const nome = prompt('Nome do script:');
        if (!nome) return;
        const salvos = JSON.parse(localStorage.getItem('mc_scripts') || '{}');
        salvos[nome] = editor.value;
        localStorage.setItem('mc_scripts', JSON.stringify(salvos));
        carregarPresets();
        log(`✓ Salvo como "${nome}"`, 'ok');
    });
    
    // Carregar lista de scripts salvos
    const carregarPresets = () => {
        const salvos = JSON.parse(localStorage.getItem('mc_scripts') || '{}');
        presets.innerHTML = '<option value="">-- Scripts salvos --</option>';
        for (const nome of Object.keys(salvos)) {
            const opt = document.createElement('option');
            opt.value = nome;
            opt.textContent = nome;
            presets.appendChild(opt);
        }
    };
    
    presets.addEventListener('change', () => {
        if (!presets.value) return;
        const salvos = JSON.parse(localStorage.getItem('mc_scripts') || '{}');
        editor.value = salvos[presets.value] || '';
    });
    
    carregarPresets();
    
    // Minimizar / Fechar
    container.querySelector('.mc-min').addEventListener('click', () => {
        container.classList.toggle('minimized');
    });
    container.querySelector('.mc-close').addEventListener('click', () => {
        container.style.display = 'none';
    });
    
    // Arrastar a janela
    let arrastando = false, offX = 0, offY = 0;
    header.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return;
        arrastando = true;
        offX = e.clientX - container.offsetLeft;
        offY = e.clientY - container.offsetTop;
    });
    document.addEventListener('mousemove', e => {
        if (!arrastando) return;
        container.style.left = (e.clientX - offX) + 'px';
        container.style.top = (e.clientY - offY) + 'px';
        container.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => arrastando = false);
    
    // API global pra reabrir
    window.__meuConsole = {
        toggle: () => {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    log('Console pronto! Cole seu script e clique em Executar.', 'ok');
})();
