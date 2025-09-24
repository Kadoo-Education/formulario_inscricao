<?php
// classes/Validator.php - Atualizado para hackathon

class Validator {
    
    public static function validarCPF($cpf) {
        // Remove caracteres não numéricos
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        // Verifica se tem 11 dígitos
        if (strlen($cpf) != 11) {
            return false;
        }
        
        // Verifica se não são todos iguais
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }
        
        // Validação do primeiro dígito verificador
        $soma = 0;
        for ($i = 0; $i < 9; $i++) {
            $soma += $cpf[$i] * (10 - $i);
        }
        $resto = $soma % 11;
        $digito1 = $resto < 2 ? 0 : 11 - $resto;
        
        if ($cpf[9] != $digito1) {
            return false;
        }
        
        // Validação do segundo dígito verificador
        $soma = 0;
        for ($i = 0; $i < 10; $i++) {
            $soma += $cpf[$i] * (11 - $i);
        }
        $resto = $soma % 11;
        $digito2 = $resto < 2 ? 0 : 11 - $resto;
        
        return $cpf[10] == $digito2;
    }
    
    public static function validarEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function validarTelefone($telefone) {
        // Remove caracteres não numéricos
        $telefone = preg_replace('/[^0-9]/', '', $telefone);
        
        // Verifica formato brasileiro (10 ou 11 dígitos)
        return preg_match('/^(\d{2})(\d{4,5})(\d{4})$/', $telefone);
    }
    
    public static function validarIdade($idade) {
        $idade = (int)$idade;
        return $idade >= 14 && $idade <= 100;
    }
    
    public static function validarEndereco($endereco) {
        $endereco = trim($endereco);
        return !empty($endereco) && strlen($endereco) >= 10;
    }
    
    public static function validarUnidadeEscolar($unidade) {
        $unidade = trim($unidade);
        return !empty($unidade) && strlen($unidade) >= 3;
    }
    
    public static function validarSerieAno($serie, $funcao) {
        // Série/ano é obrigatória apenas para estudantes
        if ($funcao === 'estudante') {
            $serie = trim($serie);
            return !empty($serie);
        }
        return true; // Opcional para professores
    }
    
    public static function validarResumoProjeito($resumo) {
        $resumo = trim($resumo);
        return !empty($resumo) && strlen($resumo) >= 50 && strlen($resumo) <= 1000;
    }
    
    public static function validarLinkPitch($link) {
        if (empty(trim($link))) {
            return false; // Link é obrigatório
        }
        
        // Verifica se é um link válido para plataformas de vídeo
        $link = trim($link);
        $patterns = [
            '/youtube\.com\/watch\?v=/',
            '/youtu\.be\//',
            '/vimeo\.com\//',
            '/drive\.google\.com/',
            '/dropbox\.com/',
            '/mega\.nz/'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $link)) {
                return filter_var($link, FILTER_VALIDATE_URL) !== false;
            }
        }
        
        return false;
    }
    
    
    public static function validarEstrutureaEquipe($membros) {
        $professores = 0;
        $estudantes = 0;
        $professorResponsavel = false;
        
        foreach ($membros as $membro) {
            if ($membro['funcao'] === 'professor') {
                $professores++;
                if (isset($membro['is_professor_responsavel']) && $membro['is_professor_responsavel']) {
                    $professorResponsavel = true;
                }
            } else {
                $estudantes++;
            }
        }
        
        $errors = [];
        
        // Deve ter exatamente 1 professor
        if ($professores !== 1) {
            $errors[] = 'A equipe deve ter exatamente 1 professor.';
        }
        
        // Deve ter entre 1 e 6 estudantes
        if ($estudantes < 1 || $estudantes > 6) {
            $errors[] = 'A equipe deve ter entre 1 e 6 estudantes.';
        }
        
        // Deve ter um professor responsável identificado
        if (!$professorResponsavel) {
            $errors[] = 'Deve haver um professor responsável identificado.';
        }
        
        // Total máximo de 7 membros (1 professor + 6 estudantes)
        if (count($membros) > 7) {
            $errors[] = 'A equipe pode ter no máximo 7 membros (1 professor + 6 estudantes).';
        }
        
        return empty($errors) ? true : $errors;
    }
    
    public static function sanitizeString($string) {
        return htmlspecialchars(trim($string), ENT_QUOTES, 'UTF-8');
    }
    
    public static function sanitizeCPF($cpf) {
        return preg_replace('/[^0-9]/', '', $cpf);
    }
    
    public static function sanitizeTelefone($telefone) {
        return preg_replace('/[^0-9]/', '', $telefone);
    }
    
    public static function formatarCPF($cpf) {
        $cpf = self::sanitizeCPF($cpf);
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }
    
    public static function formatarTelefone($telefone) {
        $telefone = self::sanitizeTelefone($telefone);
        if (strlen($telefone) == 11) {
            return preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-$3', $telefone);
        } else {
            return preg_replace('/(\d{2})(\d{4})(\d{4})/', '($1) $2-$3', $telefone);
        }
    }
}
?>