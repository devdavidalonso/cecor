# Matriz de Validação: Google Form vs Modelo de Dados

Esta matriz cruza cada campo/regra do [Formulário de Matrícula Atual](https://docs.google.com/forms/d/1rHSEhgksUtonMCZFjEYPO0t32gvTbJIYArgWrxSlL0U) com a estrutura de banco de dados definida no `DATA_MODEL.md`.

**Status Geral**: ✅ O Modelo de Dados cobre 100% dos requisitos do formulário.

---

## 1. Simulação de Cenários (User Stories)

### Cenário A: "Menor de Idade (Criança)"

- **Ação**: Seleciona "Inglês Infantil" (Sáb 10h).
- **Regra**: Obrigatório selecionar curso das 09h também.
- **Dados Pessoais**: Preenche com CPF próprio (se tiver) ou deixa em branco (validar).
- **Responsável**: Obrigatório informar Mãe/Pai.
- **Saída**: "Não pode sair sozinho".

### Cenário B: "Adulto/Voluntário"

- **Ação**: Seleciona "Costura" (4ª feira).
- **Dados Pessoais**: CPF Obrigatório.
- **Responsável**: Marca "Maioridade".
- **Saída**: "Pode sair sozinho" (Implícito).

---

## 2. Mapeamento de Campos (De -> Para)

### Página 1: Escolha de Cursos e Horários

| Campo no Form        | Onde salvamos no Banco?   | Coluna/Estrutura          | Observação                                           |
| :------------------- | :------------------------ | :------------------------ | :--------------------------------------------------- |
| **Curso Sábado 10h** | `enrollments` + `courses` | `course_id`               | Tabela `courses` terá o horário "10:00".             |
| **Curso Sábado 09h** | `enrollments` + `courses` | `course_id`               | Enrollment separado para o 2º curso.                 |
| **Lista de Espera**  | `enrollments`             | `status = 'waiting_list'` | O sistema gerencia a fila automaticamente.           |
| **Outros Horários**  | `enrollments` + `courses` | `course_id`               | Flexibilidade total de horários na tabela `courses`. |

### Página 2: Dados do Aluno

| Campo no Form       | Onde salvamos no Banco?    | Coluna/Estrutura        | Observação                                                 |
| :------------------ | :------------------------- | :---------------------- | :--------------------------------------------------------- |
| **Nome Completo**   | `users`                    | `name`                  | Base central de identidade.                                |
| **Data Nascimento** | `students` (via `users`\*) | `birth_date`            | \*Mover `birth_date` para `users` ou manter em `students`. |
| **CPF**             | `users`                    | `cpf`                   | Campo único e validado.                                    |
| **Telefone**        | `users`                    | `phone`                 | Principal contato.                                         |
| **CEP/Endereço**    | `addresses`                | `zip_code`, `street`... | Tabela dedicada a endereços.                               |

### Página 3: Família e Responsáveis

| Campo no Form        | Onde salvamos no Banco? | Coluna/Estrutura | Observação                           |
| :------------------- | :---------------------- | :--------------- | :----------------------------------- |
| **Nome Responsável** | `user_contacts`         | `name`           | Tabela unificada de contatos.        |
| **Parentesco**       | `user_contacts`         | `relationship`   | Enum: 'Father', 'Mother', 'Sibling'. |
| **Maioridade**       | Lógica de Frontend      | -                | Calculado via Data de Nascimento.    |

### Página 4: Saúde e Autorizações

| Campo no Form      | Onde salvamos no Banco? | Coluna/Estrutura            | Observação                                 |
| :----------------- | :---------------------- | :-------------------------- | :----------------------------------------- |
| **Alergias/Saúde** | `students`              | `medical_info` (JSONB)      | Flexível para descrever qualquer condição. |
| **Medicamentos**   | `students`              | `medical_info` (JSONB)      | Dentro do mesmo objeto JSON.               |
| **Emergência**     | `user_contacts`         | `is_emergency_contact=true` | Flag na tabela de contatos.                |
| **Sair Sozinho?**  | `guardian_permissions`  | `can_exit_alone` (Boolean)  | Permissão explícita.                       |

### Página 5: Perfil Socioeducacional

| Campo no Form    | Onde salvamos no Banco? | Coluna/Estrutura  | Observação                               |
| :--------------- | :---------------------- | :---------------- | :--------------------------------------- |
| **Trabalha?**    | `interview_responses`   | `content` (JSONB) | Dados para Analytics/Assistência Social. |
| **Estuda?**      | `interview_responses`   | `content` (JSONB) | Não afeta a matrícula técnica.           |
| **Expectativas** | `interview_responses`   | `content` (JSONB) | Texto livre.                             |

---

## 3. Conclusão da Validação

O banco de dados projetado (`PostgreSQL`) suporta **todos** os campos do formulário atual.

- **Pontos Fortes**: A separação de `user_contacts` e `guardian_permissions` permite uma gestão muito mais segura de quem pode buscar o aluno do que o formulário de papel.
- **Melhoria**: Os campos da Página 5 (Socioeducacional) ficarão melhor estruturados em uma tabela `student_profiles` ou coleção MongoDB no futuro, mas um campo `additional_info` (JSONB) na tabela `students` já resolve no MVP.

## 4. Planejamento do Perfil Socioeducacional (MongoDB)

Para atender à demanda de uma "Entrevista Inicial" permanente e flexível, utilizaremos o **MongoDB**. Isso permite que perguntas sejam adicionadas (ex: "Tem PC em casa?") sem alterar a estrutura do banco.

### Estratégia de Transição (SQL -> NoSQL)

Embora existam tabelas no PostgreSQL (`forms`, `questions`, etc.), a complexidade de manter formulários dinâmicos em SQL é alta. O MongoDB será o motor oficial de questionários.

| Tabela SQL Existente (Legado) | Coleção MongoDB (Nova)         | Função                                          |
| :---------------------------- | :----------------------------- | :---------------------------------------------- |
| `forms`                       | `form_definitions`             | Define o título e versão ("Perfil 2026").       |
| `form_questions`              | `form_definitions.questions[]` | Lista de perguntas dentro do documento do form. |
| `interviews`                  | `interviews`                   | Metadados da entrevista (Quem, Quando, Status). |
| `form_responses`              | `interview_responses`          | As respostas reais em JSON livre.               |

### Exemplo de Documento (Collection: `interview_responses`)

```json
{
  "_id": "ObjectId(...)",
  "interview_id": "uuid-referencia-pg",
  "student_id": 101,
  "form_version": "v1_2026",
  "answers": {
    "trabalha_atualmente": false,
    "escolaridade": "Ensino Médio Incompleto",
    "já_fez_cursos_cecor": ["Violão", "Teatro"],
    "expectativa": "Conseguir um emprego na área",
    "recursos_casa": {
      "internet": true,
      "computador": false
    }
  },
  "created_at": "2026-02-17T10:00:00Z"
}
```

### Fluxo de Apresentação

1.  **Matrícula Realizada**: O Aluno termina o cadastro básico (Páginas 1-4).
2.  **Trigger de UI**: O sistema verifica se existe uma entrevista "Perfil Inicial" pendente para este `student_id`.
3.  **Redirecionamento**: Abre o questionário (renderizado a partir de `form_definitions`).
4.  **Conclusão**: Após responder, o status do aluno pode mudar (ex: liberar carteirinha).
