let v = {};
let b = [];
let n = 1;
let d = {s:null,t:null,p:null};

document.addEventListener('DOMContentLoaded', () => {
    D();
    E();
    U();
});
function D() {
    document.querySelectorAll('.left-panel .block').forEach(block => {
        block.addEventListener('dragstart', e => {
            d.s = {t:'p', bt:block.dataset.type};
            e.dataTransfer.setData('text/plain', block.dataset.type);
        });
    });
    document.addEventListener('dragover', e => {
        e.preventDefault();
        let t = e.target.closest('.code-block,.workspace,.nested-area,.else-area');
        if (!t) return; 
        document.querySelectorAll('.code-block').forEach(b => b.classList.remove('drag-over'));
        document.querySelectorAll('.insert-marker').forEach(el => el.remove());
        if (t.classList.contains('code-block')) {
            let r = t.getBoundingClientRect();
            let pos = e.clientY < r.top + r.height / 2 ? 'b' : 'a';
            t.classList.add('drag-over');
            let m = document.createElement('div');
            m.className = 'insert-marker';
            if (pos == 'b') {
                t.parentElement.insertBefore(m, t);
                d = {...d, t:t.parentElement, p:[...t.parentElement.children].indexOf(t)};
            } else {
                t.parentElement.insertBefore(m, t.nextSibling);
                d = {...d, t:t.parentElement, p:[...t.parentElement.children].indexOf(t) + 1};
            }
        } else {
            t.classList.add('drag-over');
            d = {...d, t, p:t.children.length};
        }
    });
    document.addEventListener('drop', e => {
        e.preventDefault(); 
        document.querySelectorAll('.code-block,.insert-marker').forEach(el => {
            el.classList.remove('drag-over');
            if (el.classList.contains('insert-marker')) el.remove();
        });
        let dt = e.dataTransfer.getData('text/plain');
        if (!d.t) return;
        if (dt.startsWith('block-')) {
            M(parseInt(dt.split('-')[1]), d.t, d.p);
        } else {
            C(dt, d.t, d.p);
        }
        d = {s:null, t:null, p:null};
    });
}
function C(type, cont, pos = null) {
    let id = n++;
    let bl = document.createElement('div');
    bl.className = `code-block ${type}`;
    bl.dataset.id = id;
    bl.dataset.type = type;
    bl.draggable = true;   
    bl.addEventListener('dragstart', e => {
        d.s = {t:'w', id};
        e.dataTransfer.setData('text/plain', `block-${id}`);
        bl.classList.add('dragging');
    });
    bl.addEventListener('dragend', () => bl.classList.remove('dragging'));
    let tmpl = {
        variable: id => `
            <div class="block-header">
                <span>📤 Объявление переменных</span>
                <span class="delete-btn" onclick="deleteBlock(${id})">✖</span>
            </div>
            <div class="block-body">
                <div class="input-group">
                    <label>Имена переменных:</label>
                    <input type="text" placeholder="x,y,z" onchange="updateBlockData(${id},'vars',this.value)">
                </div>
                <small>Все = 0</small>
            </div>`,
        
        assignment: id => `
            <div class="block-header">
                <span>➡️ Присваивание</span>
                <span class="delete-btn" onclick="deleteBlock(${id})">✖</span>
            </div>
            <div class="block-body">
                <div class="input-group">
                    <label>Переменная:</label>
                    <input type="text" placeholder="x" onchange="updateBlockData(${id},'target',this.value)">
                </div>
                <div class="input-group">
                    <label>=</label>
                    <input type="text" placeholder="y+5*2" onchange="updateBlockData(${id},'expression',this.value)">
                </div>
            </div>`,
        
        if: id => `
            <div class="block-header">
                <span>🔀 Условие IF</span>
                <span class="delete-btn" onclick="deleteBlock(${id})">✖</span>
            </div>
            <div class="block-body">
                <div class="condition-row">
                    <input type="text" placeholder="x" onchange="updateBlockData(${id},'left',this.value)">
                    <select onchange="updateBlockData(${id},'operator',this.value)">
                        ${['>','<','>=','<=','==','!='].map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                    <input type="text" placeholder="y" onchange="updateBlockData(${id},'right',this.value)">
                </div>
                <div class="nested-area" id="n-${id}"><div class="nested-placeholder">⟳ IF</div></div>
                <div class="else-section">
                    <div class="else-header">
                        <span>ELSE</span>
                        <button class="toggle-else">➕ ELSE</button>
                    </div>
                    <div class="else-area" id="e-${id}"><div class="else-placeholder">⟳ ELSE</div></div>
                </div>
            </div>`, 
        begin: id => `
            <div class="block-header">
                <span>{ } Begin-End</span>
                <span class="delete-btn" onclick="deleteBlock(${id})">✖</span>
            </div>
            <div class="block-body">
                <div class="nested-area" id="n-${id}"><div class="nested-placeholder">⟳ Вложенные блоки</div></div>
            </div>`
    };
    bl.innerHTML = tmpl[type](id);
    if (type == 'if') {
        let btn = bl.querySelector('.toggle-else');
        let ar = bl.querySelector('.else-area');
        btn.onclick = () => {
            ar.classList.toggle('visible');
            btn.textContent = ar.classList.contains('visible') ? '➖ Убрать ELSE' : '➕ ELSE';
        };
    }
    if (pos != null && pos < cont.children.length) {
        cont.insertBefore(bl, cont.children[pos]);
    } else {
        cont.appendChild(bl);
    }
    document.querySelectorAll('.workspace-placeholder,.nested-placeholder,.else-placeholder')
        .forEach(p => p.style.display = 'none');
    
    b.push({id, type, element: bl, data: {}});
    U();
    return bl;
}
function M(id, nc, pos) {
    let bl = b.find(b => b.id == id);
    if (!bl) return;
    
    if (pos < nc.children.length) {
        nc.insertBefore(bl.element, nc.children[pos]);
    } else {
        nc.appendChild(bl.element);
    }
}
function updateBlockData(id, f, val) {
    let bl = b.find(b => b.id == id);
    if (bl) { bl.data = {...bl.data, [f]: val}; }
}
window.updateBlockData = updateBlockData;
window.deleteBlock = id => {
    let i = b.findIndex(b => b.id == id);
    if (i != -1) {
        b[i].element.remove();
        b.splice(i, 1);
        U();
    }
};
function calc(expr) {
    if (!expr) return 0;  
    let s = expr.replace(/\s/g, '');
    for (let varName in v) {
        let regex = new RegExp('\\b' + varName + '\\b', 'g');
        s = s.replace(regex, v[varName]);
    }
    for (let i = 0; i < s.length; i++) {
        let ch = s[i];
        if (!'0123456789+-*/%()'.includes(ch)) {
            throw new Error(`Недопустимый символ: ${ch}`);
        }
    }
    return parseExpression(s);
    function parseExpression(str) {
        let pos = 0;
        function nextChar() {
            return pos < str.length ? str[pos] : null;
        }
        function parseNumber() {
            let numStr = '';
            while (nextChar() && '0123456789'.includes(nextChar())) {
                numStr += nextChar();
                pos++;
            }
            return numStr === '' ? null : parseInt(numStr, 10);
        }
        function parseFactor() {
            if (nextChar() === '(') {
                pos++;
                let value = parseAddSubtract();
                if (nextChar() !== ')') {
                    throw new Error('Нет закрывающей скобки');
                }
                pos++;
                return value;
            } else if (nextChar() === '-') {
                pos++;
                return -parseFactor();
            } else {
                let num = parseNumber();
                if (num === null) {
                    throw new Error('Ожидалось число');
                }
                return num;
            }
        }
        function parseMultiplyDivide() {
            let left = parseFactor();   
            while (nextChar() === '*' || nextChar() === '/' || nextChar() === '%') {
                let op = nextChar();
                pos++;
                let right = parseFactor();
                if (op === '*') {
                    left = left * right;
                } else if (op === '/') {
                    if (right === 0) throw new Error('Деление на ноль');
                    left = Math.floor(left / right);
                } else if (op === '%') {
                    if (right === 0) throw new Error('Остаток от деления на ноль');
                    left = left % right;
                }
            }   
            return left;
        }
        function parseAddSubtract() {
            let left = parseMultiplyDivide();
            while (nextChar() === '+' || nextChar() === '-') {
                let op = nextChar();
                pos++;
                let right = parseMultiplyDivide();
                
                if (op === '+') {
                    left = left + right;
                } else {
                    left = left - right;
                }
            }
            
            return left;
        }
        return parseAddSubtract();
    }
}
function runProgram() {
    document.querySelector('.output-box').innerHTML = '';
    document.querySelector('.errors-box').innerHTML = '';
    v = {};
    addO('=== ЗАПУСК ПРОГРАММЫ ===');   
    try {
        ex(document.querySelector('.workspace'));
        addO('✅ Программа завершена');
    } catch (e) {
        addE(`❌ Ошибка: ${e.message}`);
        if (e.blockId) {
            document.querySelector(`[data-id="${e.blockId}"]`).classList.add('error');
            setTimeout(() => document.querySelectorAll('.error').forEach(el => el.classList.remove('error')), 2000);
        }
    }
    V();
    U();
}
function ex(cont) {
    [...cont.children].forEach(c => {
        if (!c.classList?.contains('code-block')) return;       
        let bl = b.find(b => b.id == parseInt(c.dataset.id));
        if (!bl) return;
        addO(`\n▶ ${bl.type}:`);
        switch (bl.type) {
            case 'variable':
                if (!bl.data.vars) {
                    throw { message: 'Не указаны имена переменных', blockId: bl.id };
                }
                bl.data.vars.split(',').map(v => v.trim()).forEach(name => {
                    if (name) {
                        v[name] = 0;
                        addO(`  ✓ ${name} = 0`);
                    }
                });
                break;
            case 'assignment':
                if (!bl.data.target || !bl.data.expression) {
                    throw { message: 'Не заполнены поля', blockId: bl.id };
                }
                if (!(bl.data.target in v)) {
                    throw { message: `'${bl.data.target}' не объявлена`, blockId: bl.id };
                }
                try {
                    let val = calc(bl.data.expression);
                    v[bl.data.target] = val;
                    addO(`  ${bl.data.target} = ${bl.data.expression} = ${val}`);
                } catch (err) {
                    throw { message: err.message, blockId: bl.id };
                }
                break;
                
            case 'if': {
                try {
                    let l = calc(bl.data.left || '0');
                    let r = calc(bl.data.right || '0');
                    let op = bl.data.operator || '>';
                    let cond = false;
                    if (op === '>') cond = l > r;
                    else if (op === '<') cond = l < r;
                    else if (op === '>=') cond = l >= r;
                    else if (op === '<=') cond = l <= r;
                    else if (op === '==') cond = l == r;
                    else if (op === '!=') cond = l != r;
                    addO(`  Проверка: ${l} ${op} ${r} = ${cond}`);
                    
                    if (cond) {
                        addO(`  ✓ IF:`);
                        ex(bl.element.querySelector('.nested-area'));
                    } else {
                        let ea = bl.element.querySelector('.else-area');
                        if (ea?.classList.contains('visible') && ea.children.length) {
                            addO(`  ✗ ELSE:`);
                            ex(ea);
                        } else {
                            addO(`  ✗ пропуск`);
                        }
                    }
                } catch (err) {
                    throw { message: `Ошибка в условии: ${err.message}`, blockId: bl.id };
                }
                break;
            }
            case 'begin':
                addO(`  {`);
                ex(bl.element.querySelector('.nested-area'));
                addO(`  }`);
                break;
        }
    });
}
function addO(t) { 
    document.querySelector('.output-box').innerHTML += t + '<br>'; 
}
function addE(t) { 
    document.querySelector('.errors-box').innerHTML += t + '<br>'; 
}
function V() {
    let box = document.querySelector('.variables-box');
    if (!Object.keys(v).length) {
        box.innerHTML = '<div class="empty-message">Нет переменных</div>';
        return;
    }
    box.innerHTML = '<table class="variables-table">' +
        Object.entries(v).map(([k, val]) => `<tr><td>${k}</td><td>=</td><td>${val}</td></tr>`).join('') +
        '</table>';
}
function U() {
    document.getElementById('blocksCount').textContent = b.length;
    document.getElementById('varsCount').textContent = Object.keys(v).length;
}
function E() {
    document.querySelector('.btn-run').addEventListener('click', runProgram);
    document.querySelector('.btn-clear').addEventListener('click', clearAll);
    document.querySelector('.btn-examples').addEventListener('click', loadExample);
}
function clearAll() {
    document.querySelector('.workspace').innerHTML =
        '<div class="workspace-placeholder"><p>✨ Перетащите блоки</p><p class="hint">Вложенные структуры</p></div>';
    b = [];
    v = {};
    document.querySelector('.output-box').innerHTML = '';
    document.querySelector('.errors-box').innerHTML = '';
    V();
    U();
}
function loadExample() {
    clearAll();
    let ws = document.querySelector('.workspace');   
    let vb = C('variable', ws);
    updateBlockData(vb.dataset.id, 'vars', 'a,b,max');
    vb.querySelector('input').value = 'a,b,max';
    let a1 = C('assignment', ws);
    updateBlockData(a1.dataset.id, 'target', 'a');
    updateBlockData(a1.dataset.id, 'expression', '10');
    let i1 = a1.querySelectorAll('input');
    i1[0].value = 'a';
    i1[1].value = '10';
    let a2 = C('assignment', ws);
    updateBlockData(a2.dataset.id, 'target', 'b');
    updateBlockData(a2.dataset.id, 'expression', '5');
    let i2 = a2.querySelectorAll('input');
    i2[0].value = 'b';
    i2[1].value = '5';
    let iff = C('if', ws);
    updateBlockData(iff.dataset.id, 'left', 'a');
    updateBlockData(iff.dataset.id, 'right', 'b');
    updateBlockData(iff.dataset.id, 'operator', '>');
    let iif = iff.querySelectorAll('input');
    iif[0].value = 'a';
    iif[1].value = 'b';
    iff.querySelector('.toggle-else').click();
    let m1 = C('assignment', iff.querySelector('.nested-area'));
    updateBlockData(m1.dataset.id, 'target', 'max');
    updateBlockData(m1.dataset.id, 'expression', 'a');
    m1.querySelectorAll('input')[0].value = 'max';
    m1.querySelectorAll('input')[1].value = 'a';
    let m2 = C('assignment', iff.querySelector('.else-area'));
    updateBlockData(m2.dataset.id, 'target', 'max');
    updateBlockData(m2.dataset.id, 'expression', 'b');
    m2.querySelectorAll('input')[0].value = 'max';
    m2.querySelectorAll('input')[1].value = 'b';
    addO('✅ Пример загружен');
}