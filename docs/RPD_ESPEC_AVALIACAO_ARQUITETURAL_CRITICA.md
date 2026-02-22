# RPD + ESPEC Consolidado + Avaliacao Arquitetural Critica (Pre-Producao)

**Projeto:** CECOR  
**Data de consolidacao:** 22/02/2026  
**Base analisada:** Documentacao em `docs/`, `backend/README.md`, `frontend/README.md`, `docker-compose.yml`, scripts e skills disponiveis na sessao.

## Atualizacao de estado - 22/02/2026 (apos homologacao local)

Melhorias confirmadas:
1. RBAC funcional por perfil no frontend e backend para rotas criticas.
2. Fluxo Keycloak estabilizado para `admin`, `professor` e `aluno`.
3. Ambiente de desenvolvimento hibrido consolidado com runbook.
4. Seed local criado para reduzir dependencia de carga manual de dados.
5. Correcoes de compatibilidade de schema no Postgres local.

Impacto na avaliacao:
1. O status de `NO-GO` para producao continua valido ate fechar pipeline e cobertura de testes.
2. Para homologacao funcional local, o projeto avancou para `GO` nesta etapa.
3. Riscos P0 de autorizacao basica e navegacao por perfil foram mitigados.

---

## 1. Diagnostico Executivo (Direto)

**Veredito atual:** `NO-GO para producao` no estado documental e de qualidade atual.

O repositorio mostra progresso funcional relevante, mas ainda existe **desalinhamento estrutural entre o que os documentos prometem e o que esta operacionalmente comprovado**. O risco principal nao e "falta de feature", e sim **falta de confiabilidade para operar em producao com seguranca e previsibilidade**.

### Principais bloqueios

1. **Arquitetura declarada conflitante**
   - O conjunto de docs alterna entre "microsservicos event-driven" e "monolito modular MVP" sem baseline oficial unico.
2. **Qualidade de engenharia abaixo do minimo para producao**
   - Cobertura de testes automatizados praticamente inexistente.
   - Ausencia de pipeline CI/CD versionado no repositorio.
3. **Documentacao operacional inconsistente**
   - Portas, dependencias, escopo MVP e roadmap se contradizem entre arquivos.
4. **Governanca de release fragil**
   - Falta gate formal de go/no-go com criterios tecnicos e de negocio mensuraveis.

---

## 2. Evidencias Objetivas (Arquivos)

1. **Conflito de arquitetura**
   - `docs/TECH_SPEC_GENERAL.md:4` define arquitetura alvo de microsservicos event-driven.
   - `docs/TECH_SPEC_MVP.md:4` define arquitetura atual como monolito modular.

2. **Conflito de requisitos nao-funcionais vs realidade**
   - `docs/PRD_GENERAL.md:61` exige microsservicos para escala.
   - `docs/TECH_SPEC_MVP.md:10` confirma unico executavel Go no MVP.

3. **Escopo Google Classroom inconsistente**
   - `docs/PRD_MVP.md:52` diz automacao Google fora do MVP (fase posterior).
   - `docs/PLANO_UNIFICADO_RESUMO.md:25` promete criacao automatica no plano de entrega.

4. **Qualidade documental com erro basico**
   - Item duplicado em `docs/PRD_MVP.md:29` e `docs/PRD_MVP.md:30`.

5. **Ambiente e operacao inconsistentes**
   - `scripts/quick_api_test.sh:10` usa `8082`.
   - `backend/README.md:129` referencia backend em `8080`.
   - `docs/COMPLETE_TEST_GUIDE.md:16` referencia `8081`.

6. **Dependencias e topologia inconsistentes**
   - `docker-compose.yml:2` afirma versao simplificada "apenas PostgreSQL".
   - `docker-compose.yml:5` tambem sobe MongoDB.

7. **Afirmacoes de engenharia sem lastro no repositorio**
   - `docs/TECH_SPEC_GENERAL.md:55` afirma CI/CD com GitHub Actions.
   - Nao ha `.github/workflows` no repositorio (verificacao local do workspace).

8. **Testes insuficientes para producao**
   - Backend: apenas 1 arquivo `_test.go` encontrado.
   - Frontend: nenhum `.spec.ts` encontrado no `frontend/src`.

---

## 3. RPD Consolidado (Produto para Produzir Agora)

Este RPD consolida **o que deve ser entregue com seguranca em producao imediata**, sem fantasia de escopo.

## 3.1 Problema de negocio

Eliminar operacao em papel/planilha para chamada, matricula e ocorrencias, com trilha minima de auditoria e operacao diaria estavel para equipe pedagogica.

## 3.2 Usuarios prioritarios (ordem de release)

1. Administrador
2. Gestor pedagogico
3. Professor
4. Aluno (somente autoatendimento essencial)

## 3.3 Escopo obrigatorio da versao de producao (V1)

1. Cadastro e manutencao de alunos, cursos, turmas e professores.
2. Matricula em turma com validacoes de regra de negocio.
3. Chamada digital por aula/turma.
4. Registro e consulta de ocorrencias.
5. Portal do professor funcional para operacao diaria.
6. Portal do aluno com consulta de frequencia e perfil basico.
7. Relatorios operacionais minimos (presenca e faltantes).

## 3.4 Escopo explicitamente fora (V1)

1. Microsservicos.
2. Mensageria de alta complexidade.
3. Integracao automatica completa com Google Classroom (se nao validada fim-a-fim).
4. BI/Data Lake.
5. Omnichannel robusto (WhatsApp/Telegram com SLA).

## 3.5 Regras de negocio minimas inegociaveis

1. Bloqueio de matricula fora de regra de idade.
2. Bloqueio de conflito de horario por aluno.
3. RBAC estrito por perfil.
4. Aluno sem permissao de editar dados sensiveis ou acessar dados de terceiros.
5. Auditoria minima para acoes sensiveis (quem, quando, o que).

## 3.6 Metricas de sucesso (mensuraveis)

1. >= 95% das chamadas lancadas no sistema (janela de 30 dias).
2. Tempo medio de registro de chamada <= 2 minutos por turma.
3. Erro 5xx em API core < 1% por dia.
4. Incidentes P1 em producao = 0 na primeira semana.
5. Disponibilidade no horario operacional >= 99,0% (meta inicial realista de MVP).

---

## 4. ESPEC Consolidada (Tecnica para Producao V1)

## 4.1 Baseline de arquitetura (oficial)

**Escolha recomendada para agora:** `Monolito modular em Go + Angular + PostgreSQL`, com componentes auxiliares somente quando comprovadamente necessarios.

Motivo: reduz risco de operacao, simplifica debug, acelera estabilizacao pre-producao.

## 4.2 Contrato tecnico minimo

1. API versionada em `/api/v1`.
2. Padrao de resposta unico para sucesso/erro.
3. Timeouts, retries e tratamento de erro padronizado por camada.
4. Validacao de entrada centralizada.
5. Logs estruturados com correlation-id.

## 4.3 Banco e dados

1. Estrategia de migracao unica (sem mistura ad-hoc de caminhos).
2. Backups automatizados de PostgreSQL com teste de restauracao semanal.
3. Politica de retencao e mascaramento para dados pessoais sensiveis.
4. Integridade referencial obrigatoria nas entidades core (student, course_class, enrollment, class_session, attendance).

## 4.4 Seguranca e acesso

1. RBAC validado por endpoint.
2. Politica de senha e expiracao alinhada ao IAM.
3. Sanitizacao de entrada e protecao XSS/CSRF conforme superficie.
4. Auditoria de alteracoes em dados sensiveis.

## 4.5 Observabilidade e operacao

1. Health checks realistas (`liveness`, `readiness`).
2. Dashboard minimo com erro 5xx, latencia p95, taxa de login falho, falha de DB.
3. Alertas para indisponibilidade de backend e degradacao de banco.

## 4.6 Testes e gates obrigatorios de release

1. Testes automatizados de backend para fluxos criticos (matricula, chamada, autorizacao, ocorrencias).
2. Testes de frontend para guards e fluxos de perfil.
3. Testes de contrato API para endpoints core.
4. Smoke test pos-deploy automatizado.
5. Build bloqueado se testes criticos falharem.

---

## 5. Avaliacao Arquitetural Critica (Severa)

## 5.1 Riscos P0 (bloqueiam producao)

1. **Falta de baseline arquitetural unico**
   - Impacto: decisoes tecnicas divergentes e regressao operacional.
   - Acao: publicar ADR 001 com stack oficial de producao V1 em ate 24h.

2. **Ausencia de esteira CI/CD versionada**
   - Impacto: deploy sem garantia minima de qualidade.
   - Acao: pipeline com build, testes e lint obrigatorios antes de qualquer release.

3. **Cobertura de testes insuficiente para fluxo critico**
   - Impacto: alta chance de quebrar matricula/chamada/permissoes em producao.
   - Acao: suite minima obrigatoria antes de GO.

## 5.2 Riscos P1 (corrigir antes da primeira semana em producao)

1. Inconsistencia de documentacao operacional (portas, envs, topologia).
2. Ambiguidade de escopo Google Classroom.
3. Falta de matriz rastreavel requisito -> teste -> evidencia de aceite.
4. Sem runbook formal de incidente e rollback.

## 5.3 Riscos P2 (enderecar no ciclo seguinte)

1. Otimizacoes de performance em listas grandes.
2. Refinamento de UX visual nao-critico.
3. Evolucao para arquitetura distribuida (somente com demanda real).

---

## 6. Avaliacao das Skills (Sessao Atual)

Skills disponiveis nesta sessao:
1. `skill-creator`
2. `skill-installer`

Diagnostico:
1. Sao skills de meta-operacao do agente, **nao** skills de dominio CECOR.
2. Nao cobrem arquitetura, QA, release governance ou LGPD do projeto.
3. Para ganho real de qualidade, o projeto precisa de skill propria, por exemplo:
   - `cecor-release-auditor` com checklist tecnico de go/no-go.
   - `cecor-architecture-guard` para validar aderencia entre docs e codigo.

---

## 7. Decisao de Producao (GO/NO-GO)

**Decisao recomendada hoje (22/02/2026):** `NO-GO`.

### Condicoes minimas para virar GO

1. ADR unico de arquitetura V1 aprovado e aplicado na documentacao principal.
2. CI minimo ativo no repositorio com gates obrigatorios.
3. Suite de testes criticos implementada e executada com sucesso.
4. Consolidacao final de portas/ambiente/execucao em um unico guia operacional.
5. Dry-run completo de deploy + rollback em ambiente de staging.

---

## 8. Plano de Execucao de 7 Dias (Pragmatico)

## Dia 1
1. Publicar ADR V1 (monolito modular) e congelar escopo V1.
2. Remover/arquivar docs conflitantes ou marcar como "future architecture".

## Dia 2
1. Criar pipeline CI basico (backend + frontend + smoke).
2. Definir quality gates de merge.

## Dia 3-4
1. Implementar testes automatizados dos fluxos criticos.
2. Fechar bugs P0/P1 de autorizacao e matricula.

## Dia 5
1. Revisar observabilidade minima e alertas.
2. Formalizar runbook de incidente e rollback.

## Dia 6
1. Teste integrado em staging com roteiro unico.
2. Congelar release candidate.

## Dia 7
1. Reuniao de go/no-go baseada em evidencias.
2. Deploy controlado com janela e plano de contingencia.

---

## 9. Conclusao

O projeto tem base funcional para avancar, mas ainda nao tem disciplina de engenharia suficiente para producao segura.  
Com as correcoes acima, e viavel atingir prontidao real em curto prazo sem inflar arquitetura prematuramente.
