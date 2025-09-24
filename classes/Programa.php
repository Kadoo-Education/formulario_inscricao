<?php
class Programa {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Buscar programas ativos
     */
    public function buscarProgramasAtivos() {
        $stmt = $this->pdo->prepare("
            SELECT id, nome, descricao 
            FROM programas 
            WHERE ativo = 1 AND inscricoes_abertas = 1 
            ORDER BY nome
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar se programa existe e está ativo
     */
    public function verificarPrograma($programa_id) {
        $stmt = $this->pdo->prepare("
            SELECT id 
            FROM programas 
            WHERE id = ? AND ativo = 1 AND inscricoes_abertas = 1
        ");
        $stmt->execute([$programa_id]);
        return $stmt->fetch() !== false;
    }
}
?>