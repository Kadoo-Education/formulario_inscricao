<?php
// Todos os erros
error_reporting(E_ALL);
session_start();

require_once 'config/database.php';
require_once 'classes/Programa.php';
require_once 'includes/process_inscricao.php';

$success_message = null;
$error_message = null;
$programas = [];

// Buscar programas disponíveis
try {
    $db = new Database();
    $programa = new Programa($db->getPDO());
    $programas = $programa->buscarProgramasAtivos();
} catch (Exception $e) {
    $error_message = "Erro de conexão com o banco de dados.";
}

// Processar formulário se enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($error_message)) {
    $resultado = processarInscricao($_POST);
    
    if ($resultado['success']) {
        $success_message = $resultado['message'];
    } else {
        $error_message = $resultado['message'];
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscrição por Equipes - Kadoo Education</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://kadooedu.com.br/wp-content/uploads/2025/04/cropped-k-3-1-1-dJoZbzKQKqUb0kPL-1.png" alt="Kadoo" style="width: 32px; height: 32px; border-radius: 6px;">
            </div>
            <h1>Inscrição por Equipes</h1>
            <p>Kadoo Education</p>
        </div>

        <div class="form-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>

            <?php if ($success_message): ?>
                <div class="alert alert-success">
                    <?php echo htmlspecialchars($success_message); ?>
                </div>
            <?php endif; ?>

            <?php if ($error_message): ?>
                <div class="alert alert-error">
                    <?php echo htmlspecialchars($error_message); ?>
                </div>
            <?php endif; ?>

            <?php if (empty($programas) && !$error_message): ?>
                <div class="alert alert-error">
                    Nenhum programa disponível no momento.
                </div>
            <?php elseif (!empty($programas)): ?>

            <div class="info-card">
                <strong>Informações importantes:</strong><br>
                • Equipes de até 6 membros<br>
                • O primeiro membro será o líder<br>
                • Todos os dados são obrigatórios
            </div>

            <?php include 'templates/form.php'; ?>

            <?php endif; ?>
        </div>
    </div>

    <script src="assets/js/form.js"></script>
</body>
</html>