<form id="teamForm" method="POST" action="">
    <!-- Seção 1: Programa -->
    <div class="section" id="section1">
        <h3 class="section-title">
            <span class="section-number">1</span>
            Programa e Equipe
        </h3>
        
        <div class="form-group">
            <label for="programa">Programa <span class="required">*</span></label>
            <select id="programa" name="programa" required>
                <option value="">Selecione o programa...</option>
                <?php foreach ($programas as $programa_item): ?>
                    <option value="<?php echo $programa_item['id']; ?>" <?php echo (isset($_POST['programa']) && $_POST['programa'] == $programa_item['id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($programa_item['nome']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label for="nome_equipe">Nome da Equipe <span class="required">*</span></label>
            <input type="text" id="nome_equipe" name="nome_equipe" required maxlength="100" placeholder="Digite o nome da sua equipe" value="<?php echo isset($_POST['nome_equipe']) ? htmlspecialchars($_POST['nome_equipe']) : ''; ?>">
        </div>

        <div class="form-group">
            <label for="como_conheceu">Como conheceu o programa? <span class="required">*</span></label>
            <select id="como_conheceu" name="como_conheceu" required>
                <option value="">Selecione...</option>
                <option value="redes-sociais" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'redes-sociais') ? 'selected' : ''; ?>>Redes Sociais</option>
                <option value="site" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'site') ? 'selected' : ''; ?>>Site Kadoo Education</option>
                <option value="indicacao" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'indicacao') ? 'selected' : ''; ?>>Indicação</option>
                <option value="escola" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'escola') ? 'selected' : ''; ?>>Escola/Universidade</option>
                <option value="google" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'google') ? 'selected' : ''; ?>>Google</option>
                <option value="outro" <?php echo (isset($_POST['como_conheceu']) && $_POST['como_conheceu'] == 'outro') ? 'selected' : ''; ?>>Outro</option>
            </select>
        </div>
    </div>

    <!-- Seção 2: Membros -->
    <div class="section" id="section2">
        <h3 class="section-title">
            <span class="section-number">2</span>
            Membros da Equipe
        </h3>
        
        <div class="member-counter">
            <span id="memberCount">1</span> de 6 membros
        </div>

        <div id="teamMembers">
            <!-- Líder -->
            <div class="member-card leader" data-member="1">
                <div class="member-header">
                    <div class="member-title">Membro 1</div>
                    <div class="leader-badge">Líder</div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome Completo <span class="required">*</span></label>
                        <input type="text" name="membro_1_nome" required maxlength="255" value="<?php echo isset($_POST['membro_1_nome']) ? htmlspecialchars($_POST['membro_1_nome']) : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label>E-mail <span class="required">*</span></label>
                        <input type="email" name="membro_1_email" required maxlength="255" value="<?php echo isset($_POST['membro_1_email']) ? htmlspecialchars($_POST['membro_1_email']) : ''; ?>">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>CPF <span class="required">*</span></label>
                        <input type="text" name="membro_1_cpf" class="cpf-mask" required maxlength="14" placeholder="000.000.000-00" value="<?php echo isset($_POST['membro_1_cpf']) ? htmlspecialchars($_POST['membro_1_cpf']) : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label>Telefone <span class="required">*</span></label>
                        <input type="tel" name="membro_1_telefone" class="phone-mask" required maxlength="20" value="<?php echo isset($_POST['membro_1_telefone']) ? htmlspecialchars($_POST['membro_1_telefone']) : ''; ?>">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Idade <span class="required">*</span></label>
                        <input type="number" name="membro_1_idade" min="14" max="100" required value="<?php echo isset($_POST['membro_1_idade']) ? htmlspecialchars($_POST['membro_1_idade']) : ''; ?>">
                    </div>
                    
                    
                    <div class="form-group">
                        <label>Função <span class="required">*</span></label>
                        <div class="radio-group">
                            <div class="radio-option">
                                <input type="radio" name="membro_1_cargo" value="aluno" required <?php echo (isset($_POST['membro_1_cargo']) && $_POST['membro_1_cargo'] == 'aluno') ? 'checked' : ''; ?>>
                                <span>Aluno</span>
                            </div>
                            
                            <div class="radio-option">
                                <input type="radio" name="membro_1_cargo" value="professor" required <?php echo (isset($_POST['membro_1_cargo']) && $_POST['membro_1_cargo'] == 'professor') ? 'checked' : ''; ?>>
                                <span>Professor</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- adicionado serie/ano -->  

                    <div class="form-group">
                        <label>Série/Ano <span class="required">*</span></label>
                        <div class="select-group">
                            <select name="membro_1_serie" required>
                                <option value="">Selecione</option>
                                <option value="1" <?php echo (isset($_POST['membro_1_serie']) && $_POST['membro_1_serie'] == '1') ? 'selected' : ''; ?>>1º Ano</option>
                                <option value="2" <?php echo (isset($_POST['membro_1_serie']) && $_POST['membro_1_serie'] == '2') ? 'selected' : ''; ?>>2º Ano</option>
                                <option value="3" <?php echo (isset($_POST['membro_1_serie']) && $_POST['membro_1_serie'] == '3') ? 'selected' : ''; ?>>3º Ano</option>
                            </select>
                        </div>
                    </div>
                    
                <!-- UNIDADE ESCOLAR -->
                    <div class="form-group">
                        <label>Unidade Escolar <span class="required">*</span></label>
                        <div class="select-group">
                            <select name="membro_1_unidade" required>
                                <option value="">Selecione</option>
                                <option value="Bacelar Portela" <?php echo (isset($_POST['membro_1_unidade']) && $_POST['membro_1_unidade'] == 'Bacelar Portela') ? 'selected' : ''; ?>>Bacelar Portela</option>
                                <option value="Desembargador Sarney" <?php echo (isset($_POST['membro_1_unidade']) && $_POST['membro_1_unidade'] == 'Desembargador Sarney') ? 'selected' : ''; ?>>Desembargador Sarney</option>
                                <option value="Tamancão" <?php echo (isset($_POST['membro_1_unidade']) && $_POST['membro_1_unidade'] == 'Tamancão') ? 'selected' : ''; ?>>Tamancão</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Necessidade específica -->
                    <div class="form-group necessidade-especifica" style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
                        <div>
                            <label class="main-label" for="membro_1_necessidade">Você deseja informar alguma necessidade específica para sua participação?</label>
                            <div class="select-group" style="max-width: 320px;">
                                <select name="membro_1_necessidade" id="membro_1_necessidade" required>
                                    <option value="nao" <?php echo (isset($_POST['membro_1_necessidade']) && $_POST['membro_1_necessidade'] == 'nao') ? 'selected' : ''; ?>>Não, não necessito de apoio adicional</option>
                                    <option value="sim" <?php echo (isset($_POST['membro_1_necessidade']) && $_POST['membro_1_necessidade'] == 'sim') ? 'selected' : ''; ?>>Sim, gostaria de solicitar suporte</option>
                                </select>
                            </div>
                        </div>
                        <div class="tipo-necessidade" id="tipoNecessidade_1" style="display:none;">
                            <label class="main-label" for="membro_1_tipo_necessidade">Tipo de necessidade:</label>
                            <div class="select-group" style="max-width: 320px;">
                                <select name="membro_1_tipo_necessidade" id="membro_1_tipo_necessidade">
                                    <option value="">Selecione...</option>
                                    <option value="def_fisica" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'def_fisica') ? 'selected' : ''; ?>>Deficiência física/mobilidade</option>
                                    <option value="def_visual" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'def_visual') ? 'selected' : ''; ?>>Deficiência visual</option>
                                    <option value="def_auditiva" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'def_auditiva') ? 'selected' : ''; ?>>Deficiência auditiva</option>
                                    <option value="tea" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'tea') ? 'selected' : ''; ?>>TEA</option>
                                    <option value="tdah" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'tdah') ? 'selected' : ''; ?>>TDAH</option>
                                    <option value="dislexia" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'dislexia') ? 'selected' : ''; ?>>Dislexia/dificuldade de aprendizagem</option>
                                    <option value="cond_medica" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'cond_medica') ? 'selected' : ''; ?>>Condição médica/saúde</option>
                                    <option value="outro" <?php echo (isset($_POST['membro_1_tipo_necessidade']) && $_POST['membro_1_tipo_necessidade'] == 'outro') ? 'selected' : ''; ?>>Outro</option>
                                </select>
                            </div>
                            <div id="outroNecessidade_1" style="margin-top:10px; display:none;">
                                <input type="text" name="membro_1_tipo_necessidade_outro" placeholder="Descreva a necessidade" style="width:100%;max-width:320px;">
                            </div>
                        </div>
                    </div>

                </div>
                
                <input type="hidden" name="membro_1_lider" value="1">
            </div>
        </div>

        <div class="add-member" id="addMemberBtn">
            <div style="font-size: 24px; margin-bottom: 8px;">+</div>
            <div>Adicionar Membro</div>
        </div>
    </div>

<!-- Seção 3: Finalização -->
    <div class="section" id="section3">
        <h3 class="section-title">
            <span class="section-number">3</span>
            Finalização
        </h3>
        
        <div class="form-group">
            <label for="observacoes">Resumo do projeto</label>
            <textarea id="observacoes" name="observacoes" rows="4" placeholder="Descrição resumida da proposta ou protótipo a ser desenvolvido no hackathon... "><?php echo isset($_POST['observacoes']) ? htmlspecialchars($_POST['observacoes']) : ''; ?></textarea>
        </div>

        <div class="form-group">
            <label for="link_pitch"> Apresentação do Pitch – Inserir o link do vídeo hospedado em plataforma de compartilhamento online. <span class="required">*</span></label>
            <input type="url" id="link_pitch" name="link_pitch" placeholder="https://youtube.com/watch?v=..." required value="<?php echo isset($_POST['link_pitch']) ? htmlspecialchars($_POST['link_pitch']) : ''; ?>">
        </div>

        <div class="terms-section">
            <div class="terms-title">Termos e Condições</div>             
        <div class="terms-content">                 
                <p><strong>Ao realizar sua inscrição, o(a) participante declara estar ciente e de acordo com as seguintes condições:</strong></p>
                
                <p><strong>1. Da Participação</strong></p>
                <p>• A participação é voluntária, gratuita e sem fins lucrativos.</p>
                <p>• O participante compromete-se a participar ativamente de todas as etapas do Hackathon, incluindo mentorias, oficinas, atividades presenciais e online, respeitando prazos e cronograma definidos pela organização.</p>
                <p>• Cada participante é responsável por fornecer informações verídicas, completas e atualizadas no ato da inscrição.</p>
                
                <p><strong>2. Da Conduta</strong></p>
                <p>• É dever do(a) participante manter conduta ética, respeitosa e colaborativa com colegas, mentores, jurados e equipe organizadora.</p>
                <p>• É vedada qualquer forma de discriminação, assédio, plágio ou conduta inadequada, sob pena de desclassificação imediata.</p>
                
                <p><strong>3. Do Uso de Imagem e Voz</strong></p>
                <p>• O participante autoriza o uso de sua imagem, voz e nome em fotos, vídeos e demais registros produzidos durante o Hackathon, exclusivamente para fins educacionais, científicos, culturais e institucionais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                <p>• Para menores de 18 anos, é obrigatória a assinatura do Termo de Autorização de Uso de Imagem e Voz pelo responsável legal, conforme modelo anexo ao edital.</p>
                
                <p><strong>4. Da Propriedade Intelectual e Cessão de Direitos Autorais</strong></p>
                <p>• Os protótipos, soluções e ideias desenvolvidos durante o Hackathon serão de autoria dos(as) participantes.</p>
                <p>• Contudo, o(a) participante cede, de forma gratuita, total, irrevogável e irretratável, ao IEMA e à Defensoria Pública do Estado do Maranhão (DPE/MA), os direitos de utilização, divulgação, publicação, reprodução, adaptação, armazenamento e distribuição dos materiais desenvolvidos, em qualquer meio físico ou digital, para fins educacionais, científicos, sociais e institucionais.</p>
                <p>• A cessão não impede que o participante, de forma individual ou em grupo, continue aprimorando ou utilizando a solução criada em outros contextos, desde que respeitado o caráter público e educativo do evento.</p>
                <p>• Para formalização, será exigida a assinatura da Declaração de Cessão de Direitos Autorais, conforme modelo anexo ao edital.</p>
                
                <p><strong>5. Dos Termos de Autorização e Documentos Obrigatórios</strong></p>
                <p>Para efetivar sua inscrição, o(a) participante deverá apresentar:</p>
                <p>1. Termo de Autorização para Participação (obrigatório a todos os participantes).</p>
                <p>2. Termo de Autorização de Uso de Imagem e Voz (obrigatório a todos os participantes).</p>
                <p>3. Declaração de Cessão de Direitos Autorais das soluções/protótipos criados (obrigatório a todos os participantes).</p>
                
                <p><strong>6. Do Cancelamento da Participação</strong></p>
                <p>A organização reserva-se o direito de cancelar a participação do inscrito em caso de:</p>
                <p>• Descumprimento dos prazos ou regras deste regulamento;</p>
                <p>• Conduta inadequada, desrespeitosa ou que viole a integridade do evento;</p>
                <p>• Fornecimento de informações falsas ou fraudulentas.</p>
                
                <p><strong>7. Das Disposições Finais</strong></p>
                <p>• A inscrição implica a aceitação integral destes Termos e Condições.</p>
                <p>• Os casos omissos serão resolvidos pela Comissão Organizadora do Hackathon.</p>
            </div>             
            <label class="terms-accept">                 
                <input type="checkbox" name="aceite_termos" value="1" required <?php echo (isset($_POST['aceite_termos']) && $_POST['aceite_termos'] == '1') ? 'checked' : ''; ?>>                 
                <span>Li e aceito os termos e condições <span class="required">*</span></span>             
            </label>
        </div>

        <button type="submit" class="submit-btn">
            Inscrever Equipe
        </button>
    </div>
</form>

