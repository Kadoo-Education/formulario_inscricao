# Especificação Técnica: Motor de Captura PNCP (Scraper)

**Data:** 19/05/2026  
**Status:** Em Revisão  
**Versão:** 1.0

## 1. Objetivo
Implementar um motor de captura (ETL) robusto e modular para extrair editais de "Dispensa de Licitação" (Lei 14.133) da API do PNCP (Portal Nacional de Contratações Públicas), visando alimentar o banco de dados do Radar de Licitações.

## 2. Arquitetura do Sistema
O motor será dividido em duas camadas principais para garantir a separação de responsabilidades (Clean Architecture):

### 2.1. Camada de Integração (`PNCPClient`)
- **Responsabilidade:** Comunicação de baixo nível com a API externa.
- **Tecnologia:** `httpx` (Assíncrono).
- **Funções:**
    - `fetch_contratacoes(data_inicial, data_final, pagina)`: Consulta o endpoint `/v1/contratacoes/publicacao`.
    - Tratamento de retentativas (retry logic) e timeouts.

### 2.2. Camada de Negócio (`LicitacaoService`)
- **Responsabilidade:** Orquestração, filtragem e persistência.
- **Lógica de Captura:**
    - **Carga Inicial:** Busca os últimos 30 dias de publicações.
    - **Carga Incremental:** Busca publicações do dia atual (execução periódica).
- **Lógica de Persistência (Upsert):**
    - Identificador Único: `id_pncp` (composto por CNPJ + Ano + Sequencial no PNCP).
    - Se o registro já existir: Atualiza todos os campos (preços, prazos, objeto).
    - Se não existir: Cria novo registro com UUID interno.

## 3. Modelo de Dados (Mínimo)
Campos a serem mapeados e persistidos:
- `id`: UUID (PK)
- `id_pncp`: String (Unique Index)
- `orgao_nome`: String
- `objeto`: Text
- `valor_estimado`: Decimal/Float
- `data_publicacao`: DateTime
- `data_fim_propostas`: DateTime (Crítico para alertas)
- `link_origem`: String
- `status`: String (Mapeado a partir da situação no PNCP)

## 4. Filtros de Negócio
- **Modalidade:** 8 (Dispensa de Licitação).
- **Situação:** Priorizar itens onde a data atual é anterior à `data_fim_propostas`.

## 5. Estratégia de Erros e Logs
- Logar início e fim de cada rodada de sincronização.
- Registrar quantidade de itens: total processado, novos inseridos e existentes atualizados.
- Capturar exceções de rede e de banco de dados para evitar parada do serviço.

## 6. Próximos Passos (Implementação)
1. Setup do ambiente (FastAPI + SQLAlchemy + Docker).
2. Criação dos modelos de banco de dados.
3. Implementação do `PNCPClient`.
4. Implementação do `LicitacaoService` com lógica de Upsert.
5. Integração com o agendador (`APScheduler`).
