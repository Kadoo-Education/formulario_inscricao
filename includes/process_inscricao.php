<?php
require_once 'config/database.php';
require_once 'classes/Validator.php';
require_once 'classes/Programa.php';
require_once 'classes/Equipe.php';

function processarInscricao($post_data)
{
    try {
        $db = new Database();
        $pdo = $db->getPDO();
        $programa = new Programa($pdo);
        $equipe = new Equipe($pdo);

        $pdo->beginTransaction();

        // Validar dados básicos - CORRIGIDO
        $programa_id = $post_data['programa'] ?? null;
        $nome_equipe = Validator::sanitizeString($post_data['nome_equipe'] ?? '');
        $link_pitch = Validator::sanitizeString($post_data['link_pitch'] ?? ''); // ADICIONADO
        $categoria_id = $post_data['categoria'] ?? null; 

        // Validação inicial - CORRIGIDO
        if (!$programa_id || !$nome_equipe || !$link_pitch || !$categoria_id) {
            throw new Exception("Programa, nome da equipe, link do pitch e categoria são obrigatórios.");
        }


        // Validar se é uma URL válida - MOVIDO PARA CIMA
        if (!filter_var($link_pitch, FILTER_VALIDATE_URL)) {
            throw new Exception("Link do pitch deve ser uma URL válida.");
        }



        // Criar equipe - CORRIGIDO com link_pitch
        $equipe_id = $equipe->criarEquipe(
            $programa_id,
            $nome_equipe,
            descricao: $post_data['observacoes'] ?? '',
            link_pitch: $link_pitch,
            categoria_id: $categoria_id
        );

        // Processar membros da equipe
        $membros_inseridos = 0;
        $lider_cpf = null;
        $cpfs_utilizados = [];
        $emails_utilizados = [];

        for ($i = 1; $i <= 6; $i++) {
            if (!isset($post_data["membro_{$i}_nome"]) || empty(trim($post_data["membro_{$i}_nome"]))) {
                continue;
            }

            // Validar e sanitizar dados
            $nome = Validator::sanitizeString($post_data["membro_{$i}_nome"]);
            $email = Validator::sanitizeString($post_data["membro_{$i}_email"]);
            $cpf_raw = $post_data["membro_{$i}_cpf"];
            $telefone = $post_data["membro_{$i}_telefone"];
            $idade = $post_data["membro_{$i}_idade"];
            $cargo = $post_data["membro_{$i}_cargo"];

            if (!$nome || !$email || !$cpf_raw || !$telefone || !$idade || !$cargo) {
                throw new Exception("Todos os campos são obrigatórios para o membro {$i}.");
            }

            // Validar CPF
            $cpf = preg_replace('/[^0-9]/', '', $cpf_raw);
            if (!Validator::validarCPF($cpf)) {
                throw new Exception("CPF inválido para o membro {$i}.");
            }

            // Validar email
            if (!Validator::validarEmail($email)) {
                throw new Exception("E-mail inválido para o membro {$i}.");
            }

            // Validar idade
            if (!Validator::validarIdade($idade)) {
                throw new Exception("Idade inválida para o membro {$i}.");
            }

            // Verificar CPF duplicado na equipe
            if (in_array($cpf, $cpfs_utilizados)) {
                throw new Exception("CPF duplicado na equipe (Membro {$i}).");
            }
            $cpfs_utilizados[] = $cpf;

            // Verificar email duplicado na equipe
            $email_lower = strtolower($email);
            if (in_array($email_lower, $emails_utilizados)) {
                throw new Exception("E-mail duplicado na equipe (Membro {$i}).");
            }
            $emails_utilizados[] = $email_lower;

            // Verificar CPF já cadastrado no programa
            if ($equipe->verificarCpfPrograma($cpf, $programa_id)) {
                throw new Exception("CPF já cadastrado neste programa (Membro {$i}).");
            }

            $is_lider = isset($post_data["membro_{$i}_lider"]) && $post_data["membro_{$i}_lider"] == '1';

            // Define o líder da equipe (o primeiro membro cadastrado)
            if ($i === 1) {
                $lider_cpf = $cpf;
            }


            // Capturar série/ano
            $serie_ano = $post_data["membro_{$i}_serie"] ?? null;
            if (!$serie_ano) {
                throw new Exception("Série/Ano é obrigatório para o membro {$i}.");
            }

            // Capturar unidade escolar
            $unidade_id = $post_data["membro_{$i}_unidade"] ?? null;
            if (!$unidade_id) {
                throw new Exception("Unidade escolar é obrigatória para o membro {$i}.");
            }

            // PROCESSAR NECESSIDADES ESPECIAIS
            $necessidade_especial = $post_data["membro_{$i}_necessidade"] ?? 'nao';
            $tipo_necessidade = null;
            $descricao_necessidade = null;

            if ($necessidade_especial === 'sim') {
                $tipo_necessidade = $post_data["membro_{$i}_tipo_necessidade"] ?? '';

                // Validar se o tipo foi selecionado
                if (empty($tipo_necessidade)) {
                    throw new Exception("Tipo de necessidade é obrigatório quando solicitado suporte para o membro {$i}.");
                }

                // Se for "outro", capturar descrição
                if ($tipo_necessidade === 'outro') {
                    $descricao_necessidade = Validator::sanitizeString($post_data["membro_{$i}_tipo_necessidade_outro"] ?? '');
                    if (empty($descricao_necessidade)) {
                        throw new Exception("Descrição da necessidade é obrigatória quando selecionada opção 'Outro' para o membro {$i}.");
                    }
                }
            }

            // Dados para inserção 
            $dados_membro = [
                'programa_id' => $programa_id,
                'equipe_id' => $equipe_id,
                'is_lider' => $is_lider,
                'nome_completo' => $nome,
                'email' => $email,
                'cpf' => $cpf,
                'telefone' => $telefone,
                'idade' => $idade,
                'escolaridade' => $cargo,
                'serie_ano' => $serie_ano,
                'unidade_escolar' => $unidade_id,
                'como_conheceu' => $post_data['como_conheceu'],
                'observacoes' => $post_data['observacoes'] ?? '',
                'necessidade_especial' => $necessidade_especial,
                'tipo_necessidade' => $tipo_necessidade,
                'descricao_necessidade' => $descricao_necessidade,
                'session_id' => session_id(),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ];

            $equipe->inserirMembro($dados_membro);
            $membros_inseridos++;
        }

        if ($membros_inseridos == 0) {
            throw new Exception("Pelo menos um membro deve ser cadastrado.");
        }


        $pdo->commit();
        return [
            'success' => true,
            'message' => "Equipe '{$nome_equipe}' inscrita com sucesso! {$membros_inseridos} membros cadastrados."
        ];

    } catch (Exception $e) {
        $pdo->rollBack();
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Erro na inscrição: " . $e->getMessage());
        return [
            'success' => false,
            'message' => "Erro ao processar inscrição. Tente novamente."
        ];
    }
}
?>