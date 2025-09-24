<?php
// Configuração do banco de dados
class Database {
    private $host = '193.203.175.155';
    private $dbname = 'u782216717_inscricao';
    private $username = 'u782216717_inscricao';
    private $password = 'Kadoodevhost2025#26';
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8",
                $this->username,
                $this->password
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            throw new Exception("Erro de conexão com o banco de dados.");
        }
    }

    public function getPDO() {
        return $this->pdo;
    }
}
?>