class TeamForm {
    constructor() {
        this.memberCount = 1;
        this.maxMembers = 6;
        this.init();
    }

    init() {
        this.bindEvents();
        this.applyMasks();
        this.updateProgress();
        this.initNecessidadeEvents(); // ADICIONADO
    }

    bindEvents() {
        // Botão adicionar membro
        document.getElementById('addMemberBtn')?.addEventListener('click', () => {
            this.addMember();
        });

        // Eventos para atualizar progresso
        document.addEventListener('input', () => this.updateProgress());
        document.addEventListener('change', () => this.updateProgress());

        // Validação do formulário
        document.getElementById('teamForm')?.addEventListener('submit', (e) => {
            this.validateForm(e);
        });
    }

    // NOVO MÉTODO - Inicializar eventos de necessidades especiais
    initNecessidadeEvents() {
        for (let i = 1; i <= this.maxMembers; i++) {
            this.configurarNecessidades(i);
        }
    }

    // NOVO MÉTODO - Configurar eventos de necessidades para um membro específico
    configurarNecessidades(numeroMembro) {
        const selectNecessidade = document.getElementById(`membro_${numeroMembro}_necessidade`);
        const tipoNecessidade = document.getElementById(`tipoNecessidade_${numeroMembro}`);
        const selectTipo = document.getElementById(`membro_${numeroMembro}_tipo_necessidade`);
        const outroNecessidade = document.getElementById(`outroNecessidade_${numeroMembro}`);
        const inputOutro = document.querySelector(`input[name="membro_${numeroMembro}_tipo_necessidade_outro"]`);

        if (!selectNecessidade) return;

        // Controlar exibição do tipo de necessidade
        selectNecessidade.addEventListener('change', function () {
            if (this.value === 'sim') {
                tipoNecessidade.style.display = 'block';
                selectTipo.setAttribute('required', 'required');
            } else {
                tipoNecessidade.style.display = 'none';
                selectTipo.removeAttribute('required');
                selectTipo.value = '';
                // Esconder campo "outro" também
                if (outroNecessidade) {
                    outroNecessidade.style.display = 'none';
                    if (inputOutro) inputOutro.removeAttribute('required');
                }
            }
        });

        // Controlar exibição do campo "outro"
        if (selectTipo) {
            selectTipo.addEventListener('change', function () {
                if (this.value === 'outro') {
                    if (outroNecessidade) {
                        outroNecessidade.style.display = 'block';
                        if (inputOutro) inputOutro.setAttribute('required', 'required');
                    }
                } else {
                    if (outroNecessidade) {
                        outroNecessidade.style.display = 'none';
                        if (inputOutro) {
                            inputOutro.removeAttribute('required');
                            inputOutro.value = '';
                        }
                    }
                }
            });
        }

        // Verificar estado inicial (para quando o formulário é recarregado com dados)
        if (selectNecessidade.value === 'sim') {
            tipoNecessidade.style.display = 'block';
            selectTipo.setAttribute('required', 'required');

            if (selectTipo.value === 'outro' && outroNecessidade) {
                outroNecessidade.style.display = 'block';
                if (inputOutro) inputOutro.setAttribute('required', 'required');
            }
        }
    }

    addMember() {
        const addBtn = document.getElementById('addMemberBtn');
        if (this.memberCount >= this.maxMembers || addBtn.classList.contains('disabled')) {
            return;
        }

        this.memberCount++;
        this.updateMemberCount();

        const memberHTML = this.generateMemberHTML(this.memberCount);
        document.getElementById('teamMembers').insertAdjacentHTML('beforeend', memberHTML);

        this.applyMasks();
        this.updateProgress();
        this.configurarNecessidades(this.memberCount); // ADICIONADO

        const memberCard = document.querySelector(`[data-member="${this.memberCount}"]`);
        if (memberCard) {
            // Função/Serie
            memberCard.querySelectorAll(`input[name="membro_${this.memberCount}_cargo"]`).forEach(radio => {
                radio.addEventListener('change', function () {
                    const serieGroup = memberCard.querySelector(`#serieAnoGroup_${teamForm.memberCount}`);
                    if (this.value === 'professor') {
                        serieGroup.style.display = 'none';
                        serieGroup.querySelector('select').removeAttribute('required');
                    } else {
                        serieGroup.style.display = 'block';
                        serieGroup.querySelector('select').setAttribute('required', 'required');
                    }
                });
            });
        }
    }

    removeMember(memberNum) {
        if (memberNum === 1) return;

        const memberDiv = document.querySelector(`[data-member="${memberNum}"]`);
        if (memberDiv) {
            memberDiv.remove();
            this.memberCount--;
            this.updateMemberCount();
            this.renumberMembers();
            this.updateProgress();
        }
    }

    generateMemberHTML(memberNum) {
        return `
            <div class="member-card" data-member="${memberNum}">
                <div class="member-header">
                    <div class="member-title">Membro ${memberNum}</div>
                    <button type="button" class="remove-btn" onclick="teamForm.removeMember(${memberNum})">×</button>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome Completo <span class="required">*</span></label>
                        <input type="text" name="membro_${memberNum}_nome" required maxlength="255">
                    </div>
                    <div class="form-group">
                        <label>E-mail <span class="required">*</span></label>
                        <input type="email" name="membro_${memberNum}_email" required maxlength="255">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>CPF <span class="required">*</span></label>
                        <input type="text" name="membro_${memberNum}_cpf" class="cpf-mask" required maxlength="14" placeholder="000.000.000-00">
                    </div>
                    <div class="form-group">
                        <label>Telefone <span class="required">*</span></label>
                        <input type="tel" name="membro_${memberNum}_telefone" class="phone-mask" required maxlength="20">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Idade <span class="required">*</span></label>
                        <input type="number" name="membro_${memberNum}_idade" min="14" max="100" required>
                    </div>
                    <div class="form-group">
                        <label>Função <span class="required">*</span></label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" name="membro_${memberNum}_cargo" value="aluno" required>
                                <span>Aluno</span>
                            </div>
                            <div class="radio-option">
                                <input type="radio" name="membro_${memberNum}_cargo" value="professor" required>
                                <span>Professor</span>
                            </div>
                        </div>
                    </div>
                                    <div class="form-group serie-ano-group" id="serieAnoGroup_${memberNum}">
                    <label>Série/Ano <span class="required">*</span></label>
                    <div class="select-group">
                        <select name="membro_${memberNum}_serie" required>
                            <option value="">Selecione</option>
                            <option value="1">1º Ano</option>
                            <option value="2">2º Ano</option>
                            <option value="3">3º Ano</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Unidade Escolar <span class="required">*</span></label>
                    <div class="select-group">
                        <select name="membro_${memberNum}_unidade" required>
                            <option value="">Selecione</option>
                            ${UNIDADES_DATA.map(unidade => `<option value="${unidade.id}">${unidade.nome}</option>`).join("")}
                        </select>
                    </div>
                </div>

                </div>

                <!-- SEÇÃO DE NECESSIDADES ESPECIAIS - ADICIONADA -->
                <div class="form-group necessidade-especifica" style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
                    <div>
                        <label class="main-label" for="membro_${memberNum}_necessidade">Você deseja informar alguma necessidade específica para sua participação?</label>
                        <div class="select-group" style="max-width: 320px;">
                            <select name="membro_${memberNum}_necessidade" id="membro_${memberNum}_necessidade" required>
                                <option value="nao">Não, não necessito de apoio adicional</option>
                                <option value="sim">Sim, gostaria de solicitar suporte</option>
                            </select>
                        </div>
                    </div>
                    <div class="tipo-necessidade" id="tipoNecessidade_${memberNum}" style="display:none;">
                        <label class="main-label" for="membro_${memberNum}_tipo_necessidade">Tipo de necessidade:</label>
                        <div class="select-group" style="max-width: 320px;">
                            <select name="membro_${memberNum}_tipo_necessidade" id="membro_${memberNum}_tipo_necessidade">
                                <option value="">Selecione...</option>
                                <option value="def_fisica">Deficiência física/mobilidade</option>
                                <option value="def_visual">Deficiência visual</option>
                                <option value="def_auditiva">Deficiência auditiva</option>
                                <option value="tea">TEA</option>
                                <option value="tdah">TDAH</option>
                                <option value="dislexia">Dislexia/dificuldade de aprendizagem</option>
                                <option value="cond_medica">Condição médica/saúde</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div id="outroNecessidade_${memberNum}" style="margin-top:10px; display:none;">
                            <input type="text" name="membro_${memberNum}_tipo_necessidade_outro" placeholder="Descreva a necessidade" style="width:100%;max-width:320px;">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateMemberCount() {
        const counterSpan = document.getElementById('memberCount');
        const addBtn = document.getElementById('addMemberBtn');

        if (counterSpan) counterSpan.textContent = this.memberCount;

        if (addBtn) {
            if (this.memberCount >= this.maxMembers) {
                addBtn.classList.add('disabled');
                addBtn.innerHTML = '<div>Limite máximo atingido</div>';
            } else {
                addBtn.classList.remove('disabled');
                addBtn.innerHTML = '<div style="font-size: 24px; margin-bottom: 8px;">+</div><div>Adicionar Membro</div>';
            }
        }
    }

    renumberMembers() {
        const members = document.querySelectorAll('.member-card');
        members.forEach((member, index) => {
            const newNumber = index + 1;
            member.dataset.member = newNumber;

            const titleEl = member.querySelector('.member-title');
            if (titleEl) titleEl.textContent = `Membro ${newNumber}`;

            const inputs = member.querySelectorAll('input, select');
            inputs.forEach(input => {
                const name = input.name;
                if (name && name.includes('membro_')) {
                    const parts = name.split('_');
                    parts[1] = newNumber;
                    input.name = parts.join('_');

                    // Atualizar IDs também
                    if (input.id && input.id.includes('membro_')) {
                        const idParts = input.id.split('_');
                        idParts[1] = newNumber;
                        input.id = idParts.join('_');
                    }
                }
            });

            // Atualizar IDs das divs também
            const divsToUpdate = member.querySelectorAll('[id*="membro_"], [id*="tipoNecessidade_"], [id*="outroNecessidade_"], [id*="serieAnoGroup_"]');
            divsToUpdate.forEach(div => {
                if (div.id.includes('membro_') || div.id.includes('tipoNecessidade_') || div.id.includes('outroNecessidade_') || div.id.includes('serieAnoGroup_')) {
                    const idParts = div.id.split('_');
                    idParts[idParts.length - 1] = newNumber;
                    div.id = idParts.join('_');
                }
            });

            // Atualizar labels for
            const labels = member.querySelectorAll('label[for*="membro_"]');
            labels.forEach(label => {
                if (label.getAttribute('for')) {
                    const forParts = label.getAttribute('for').split('_');
                    forParts[1] = newNumber;
                    label.setAttribute('for', forParts.join('_'));
                }
            });

            // Atualizar botão remover
            const removeBtn = member.querySelector('.remove-btn');
            if (removeBtn && newNumber > 1) {
                removeBtn.setAttribute('onclick', `teamForm.removeMember(${newNumber})`);
            }
        });

        this.memberCount = members.length;
        this.updateMemberCount();

        // Reconfigurar eventos de necessidades após renumeração
        this.initNecessidadeEvents();
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (!progressFill) return;

        let completed = 0;

        // Seção 1
        const programa = document.getElementById('programa')?.value || '';
        const nomeEquipe = document.getElementById('nome_equipe')?.value || '';
        const comoConheceu = document.getElementById('como_conheceu')?.value || '';
        const linkPitch = document.getElementById('link_pitch')?.value || '';
        if (programa && nomeEquipe && comoConheceu && linkPitch) completed++;

        // Seção 2
        const primeiroMembro = document.querySelector('input[name="membro_1_nome"]')?.value || '';
        if (primeiroMembro) completed++;

        // Seção 3
        const termos = document.querySelector('input[name="aceite_termos"]')?.checked || false;
        if (termos) completed++;

        const progress = (completed / 3) * 100;
        progressFill.style.width = progress + '%';
    }

    applyMasks() {
        // Máscara CPF
        document.querySelectorAll('.cpf-mask').forEach(input => {
            input.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);

                if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
                } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
                }

                e.target.value = value;
            });
        });

        // Máscara Telefone
        document.querySelectorAll('.phone-mask').forEach(input => {
            input.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);

                if (value.length > 6) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d+)/, '($1) $2');
                }

                e.target.value = value;
            });
        });
    }

    // MÉTODO DE VALIDAÇÃO ATUALIZADO com validação de necessidades
    validateForm(e) {
        // Validar necessidades especiais
        const errosNecessidades = this.validarNecessidades();
        if (errosNecessidades.length > 0) {
            e.preventDefault();
            alert('Erros nas necessidades especiais:\n\n' + errosNecessidades.join('\n'));
            return false;
        }

        // Verificar CPFs duplicados
        const cpfs = [];
        document.querySelectorAll('input[name*="_cpf"]').forEach(input => {
            const cpf = input.value.replace(/\D/g, '');
            if (cpf) {
                if (cpfs.includes(cpf)) {
                    e.preventDefault();
                    alert('CPFs duplicados não são permitidos na mesma equipe.');
                    return false;
                }
                cpfs.push(cpf);
            }
        });

        // Verificar emails duplicados
        const emails = [];
        document.querySelectorAll('input[name*="_email"]').forEach(input => {
            const email = input.value.toLowerCase().trim();
            if (email) {
                if (emails.includes(email)) {
                    e.preventDefault();
                    alert('E-mails duplicados não são permitidos na mesma equipe.');
                    return false;
                }
                emails.push(email);
            }
        });

        // Verificar se pelo menos um membro foi preenchido
        let membrosPreenchidos = 0;
        for (let i = 1; i <= 6; i++) {
            const nome = document.querySelector(`input[name="membro_${i}_nome"]`);
            if (nome && nome.value.trim()) {
                membrosPreenchidos++;
            }
        }

        if (membrosPreenchidos === 0) {
            e.preventDefault();
            alert('Pelo menos um membro deve ser cadastrado.');
            return false;
        }

        const linkPitch = document.getElementById('link_pitch');
        if (linkPitch && linkPitch.value) {
            try {
                new URL(linkPitch.value);
            } catch {
                e.preventDefault();
                alert('O link do pitch deve ser uma URL válida (exemplo: https://youtube.com/watch?v=...)');
                return false;
            }
        }

        return true;
    }

    // NOVO MÉTODO - Validar campos de necessidades
    validarNecessidades() {
        let erros = [];

        for (let i = 1; i <= 6; i++) {
            const selectNecessidade = document.getElementById(`membro_${i}_necessidade`);
            if (!selectNecessidade) continue;

            const nome = document.querySelector(`input[name="membro_${i}_nome"]`);
            if (!nome || !nome.value.trim()) continue; // Se não tem nome, pula validação

            if (selectNecessidade.value === 'sim') {
                const selectTipo = document.getElementById(`membro_${i}_tipo_necessidade`);
                if (!selectTipo || !selectTipo.value) {
                    erros.push(`Membro ${i}: Tipo de necessidade é obrigatório`);
                    continue;
                }

                if (selectTipo.value === 'outro') {
                    const inputOutro = document.querySelector(`input[name="membro_${i}_tipo_necessidade_outro"]`);
                    if (!inputOutro || !inputOutro.value.trim()) {
                        erros.push(`Membro ${i}: Descrição da necessidade é obrigatória`);
                    }
                }
            }
        }

        return erros;
    }
}

// Inicializar quando o DOM estiver carregado
let teamForm;
document.addEventListener('DOMContentLoaded', function () {
    teamForm = new TeamForm();

    // --- INICIALIZA OS EVENTOS DO MEMBRO 1 ---
    const memberCard1 = document.querySelector('[data-member="1"]');
    if (memberCard1) {
        // Função/Serie
        memberCard1.querySelectorAll('input[name="membro_1_cargo"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const serieGroup = memberCard1.querySelector('#serieAnoGroup_1');
                if (this.value === 'professor') {
                    serieGroup.style.display = 'none';
                    serieGroup.querySelector('select').removeAttribute('required');
                } else {
                    serieGroup.style.display = 'block';
                    serieGroup.querySelector('select').setAttribute('required', 'required');
                }
            });
        });

        // ADICIONADO - Configurar necessidades especiais para membro 1 já existente
        teamForm.configurarNecessidades(1);
    }
});

// Função global para manter compatibilidade
window.removeMember = function (memberNum) {
    if (teamForm) {
        teamForm.removeMember(memberNum);
    }
};