# Simulação de Cenários de Matrícula: Fluxo de Dados

Este documento mapeia as ações do usuário para registros reais no Banco de Dados, validando se a estrutura suporta os cenários solicitados.

## Cenário 1: "Aluno Multitarefa" (40 Anos, Sábado)

**Perfil**: Aluno de 40 anos.
**Desejos de Matrícula**:

1.  **Violão**: Sábado, 09h às 10h.
2.  **Inglês**: Sábado, 10h às 12h.

### Matriz de Ações no Banco de Dados

| Passo | Ação do Sistema       | Tabela Afetada   | Detalhe dos Dados Gravados (Representação)                                   | Validação do Modelo                                     |
| :---- | :-------------------- | :--------------- | :--------------------------------------------------------------------------- | :------------------------------------------------------ |
| **1** | **Cadastro do Aluno** | `users`          | `{"id": 101, "name": "João", "birth_date": "1986-05-20"}`                    | ✅ Suporta data de nascimento para calcular idade (40). |
| **2** | **Ativar Perfil**     | `students`       | `{"user_id": 101, "reg_number": "2026001", "status": "active"}`              | ✅ Separação User/Student ok.                           |
| **3** | **Criar Curso 1**     | `courses`        | `{"id": 10, "name": "Violão", "start_time": "09:00", "end_time": "10:00"}`   | ✅ Tabela `courses` flexível.                           |
| **4** | **Criar Curso 2**     | `courses`        | `{"id": 11, "name": "Inglês", "start_time": "10:00", "end_time": "12:00"}`   | ✅ Suporta cursos concomitantes ou sequenciais.         |
| **5** | **Matrícula 1**       | `enrollments`    | `{"student_id": 101, "course_id": 10, "status": "active"}`                   | ✅ Vínculo N:N (Um aluno, muitos cursos).               |
| **6** | **Matrícula 2**       | `enrollments`    | `{"student_id": 101, "course_id": 11, "status": "active"}`                   | ✅ Permite múltipla inscrição.                          |
| **7** | **Gerar Grade**       | `class_sessions` | Gera aulas de Violão (09-10h) e Inglês (10-12h) para os sábados do semestre. | ✅ `class_sessions` materializa o calendário real.      |

**Resultado**: O sistema aceita perfeitamente. O aluno aparecerá na "Lista de Presença de Violão" às 9h e na de "Inglês" às 10h.

---

## Cenário 2: "Maria do Bolo" (Quinta-feira)

**Perfil**: Aluna Maria.
**Desejo**: Curso de "Bolo de Chocolate", Quinta-feira.

### Matriz de Ações no Banco de Dados

| Passo | Ação do Sistema       | Tabela Afetada   | Detalhe dos Dados Gravados (Representação)                              | Validação do Modelo                                                                                                              |
| :---- | :-------------------- | :--------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Cadastro da Aluna** | `users`          | `{"id": 102, "name": "Maria", "cpf": "123..."}`                         | ✅ Cadastro padrão.                                                                                                              |
| **2** | **Criar Curso**       | `courses`        | `{"id": 12, "name": "Culinária: Bolos", "workload": 40}`                | ✅ Suporta cursos em dias de semana (não só sábado).                                                                             |
| **3** | **Matrícula**         | `enrollments`    | `{"student_id": 102, "course_id": 12}`                                  | ✅ Simples e direto.                                                                                                             |
| **4** | **Sessão Específica** | `class_sessions` | `{"course_id": 12, "date": "2026-03-05", "topic": "Bolo de Chocolate"}` | ✅ **Aqui brilha o modelo!** O TEMA ("Bolo de Chocolate") fica na sessão do dia, enquanto o curso genérico pode ser "Culinária". |

**Conclusão**:
O modelo permite que o curso genérico seja "Culinária" (id 12), mas a aula específica do dia 05/03 seja "Bolo de Chocolate" (registrado em `class_sessions.topic`). Isso dá o nível de detalhe que a Maria e a gestão precisam ver: "Hoje tem aula de quê? De Bolo!".

---

## Resumo da Validação

1.  **Múltiplos Cursos para o mesmo aluno?** ✅ Sim (Tabela de junção `enrollments`).
2.  **Horários Diferentes/Sequenciais?** ✅ Sim (Campos de data/hora em `courses` e `class_sessions`).
3.  **Temas Específicos por Dia (Bolo)?** ✅ Sim (Campo `topic` em `class_sessions`).
