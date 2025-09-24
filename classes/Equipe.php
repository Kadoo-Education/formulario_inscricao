<?php
class Equipe {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Verificar se já existe equipe com o nome no programa
     */
    public function verificarNomeEquipe($nome_equipe, $programa_id) {
        $stmt = $this->pdo->prepare("
            SELECT id 
            FROM equipes 
            WHERE nome_equipe = ? AND programa_id = ?
        ");
        $stmt->execute([$nome_equipe, $programa_id]);
        return $stmt->fetch() !== false;
    }

    /**
     * Criar nova equipe - CORRIGIDO com link_pitch
     */
    public function criarEquipe($programa_id, $nome_equipe, $descricao = '', $link_pitch = '') {
        $stmt = $this->pdo->prepare("
            INSERT INTO equipes (programa_id, nome_equipe, descricao, link_pitch, max_membros, status, created_at) 
            VALUES (?, ?, ?, ?, 6, 'ativa', NOW())
        ");
        $stmt->execute([$programa_id, $nome_equipe, $descricao, $link_pitch]);
        return $this->pdo->lastInsertId();
    }

    /**
     * Atualizar líder da equipe
     */
    public function atualizarLider($equipe_id, $lider_cpf) {
        $stmt = $this->pdo->prepare("
            UPDATE equipes 
            SET lider_cpf = ? 
            WHERE id = ?
        ");
        $stmt->execute([$lider_cpf, $equipe_id]);
    }

    /**
     * Verificar CPF já cadastrado no programa
     */
    public function verificarCpfPrograma($cpf, $programa_id) {
        $stmt = $this->pdo->prepare("
            SELECT i.id 
            FROM inscricoes_new i 
            JOIN equipes e ON i.equipe_id = e.id 
            WHERE i.cpf = ? AND e.programa_id = ?
        ");
        $stmt->execute([$cpf, $programa_id]);
        return $stmt->fetch() !== false;
    }

    /**
     * Inserir membro na equipe
     */
    public function inserirMembro($dados) {
        $stmt = $this->pdo->prepare("
            INSERT INTO inscricoes_new (
                programa_id, equipe_id, is_lider, nome_completo, email, cpf, telefone, 
                idade, escolaridade, serie_ano, unidade_escolar, como_conheceu, observacoes,
                necessidade_especial, tipo_necessidade, descricao_necessidade,
                session_id, ip_address, user_agent, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            )
        ");
        
        return $stmt->execute([
            $dados['programa_id'],
            $dados['equipe_id'],
            $dados['is_lider'],
            $dados['nome_completo'],
            $dados['email'],
            $dados['cpf'],
            $dados['telefone'],
            $dados['idade'],
            $dados['escolaridade'],
            $dados['serie_ano'],
            $dados['unidade_escolar'],
            $dados['como_conheceu'],
            $dados['observacoes'],
            $dados['necessidade_especial'] ?? 'nao',
            $dados['tipo_necessidade'] ?? null,
            $dados['descricao_necessidade'] ?? null,
            $dados['session_id'],
            $dados['ip_address'],
            $dados['user_agent']
        ]);
    }
}
?>