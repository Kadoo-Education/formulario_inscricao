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

    /**
     * Buscar unidades
     */
    public function buscarUnidades() {
        $stmt = $this->pdo->prepare("
            SELECT id, nome 
            FROM unidades 
            ORDER BY nome
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscarCategoria() {
        $stmt = $this->pdo->prepare("
            SELECT id, nome, descricao 
            FROM categorias 
            ORDER BY nome
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function verificarCategoria($categoria_id) {
        $stmt = $this->pdo->prepare("\n            SELECT id \n            FROM categorias \n            WHERE id = ?\n        ");
        $stmt->execute([$categoria_id]);
        return $stmt->fetch() !== false;
    }



}
?>