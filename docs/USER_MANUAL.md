# Manual do Usuário - CECOR

Este guia rápido explica como utilizar as principais funcionalidades do Sistema de Gestão Educacional CECOR.

## 👨‍💼 Perfil: Administrador

Como administrador, você tem acesso total ao sistema para gerenciar a estrutura acadêmica.

### Gerenciar Alunos

1.  Acesse o menu **"Alunos"**.
2.  **Novo Aluno**: Clique no botão floating action button (`+`) no canto inferior direito.
3.  Preencha o formulário em 4 etapas:
    - **Dados Pessoais**: Nome, CPF, Data de Nascimento.
    - **Contato**: Endereço, Telefone, E-mail.
    - **Responsáveis**: Adicione um ou mais responsáveis (obrigatório para menores).
    - **Revisão**: Verifique os dados e confirme.
4.  **Editar**: Clique no ícone de lápis na lista de alunos.
5.  **Excluir**: Clique no ícone de lixeira (exclusão lógica, dados mantidos no banco).

### Gerenciar Professores (Novo)

1.  Acesse o menu **"Professores"**.
2.  **Novo Professor**: Clique no botão floating action button (`+`).
3.  Preencha o formulário simplificado:
    - **Nome** e **E-mail** (Obrigatórios).
    - **CPF** e **Telefone** (Opcionais).
4.  O sistema criará automaticamente o usuário no Keycloak com a senha temporária `prof123`.

### Gerenciar Cursos

1.  Acesse o menu **"Cursos"**.
2.  **Novo Curso**: Clique no botão `+`.
3.  Defina o **Nome**, **Descrição** e **Carga Horária**.
4.  Selecione o **Professor Responsável** na lista (integração Keycloak).
5.  Salve o curso.

### Realizar Matrículas

1.  Acesse o menu **"Matrículas"**.
2.  Selecione o **Aluno** e o **Curso** desejado.
3.  Clique em **"Matricular"**.
4.  O sistema validará se a matrícula já existe para evitar duplicidade.

---

## 👩‍🏫 Perfil: Professor

Seu foco é o acompanhamento diário das turmas e registro de aulas.

### Registrar Frequência (Chamada)

1.  No painel principal, selecione a turma desejada.
2.  Clique em **"Realizar Chamada"**.
3.  Verifique a **Data** (padrão: hoje).
4.  A lista de alunos aparecerá com a presença marcada por padrão.
5.  **Desmarque** os alunos ausentes.
6.  Clique em **"Salvar Presença"**.
    - _Nota_: Uma vez salva, a frequência é contabilizada nos relatórios imediatamente.

### Visualizar Relatórios da Turma

1.  Acesse a aba **"Relatórios"**.
2.  Selecione **"Relatório por Curso"**.
3.  Escolha a turma e o período (opcional).
4.  Veja o resumo de aulas dadas e a taxa de presença geral.
5.  Clique em **"Exportar PDF"** para validar as horas.

---

## 🧑‍🎓 Perfil: Aluno

Você pode acompanhar seu próprio desempenho e frequência.

### Minha Frequência

1.  Ao fazer login, você verá o **Painel do Aluno**.
2.  Cada card representa um curso em que você está matriculado.
3.  A barra de progresso mostra sua **Taxa de Frequência** (ex: 85%).
4.  Clique em **"Detalhes"** para ver suas faltas e presenças data a data.

---

## 🆘 Suporte

Em caso de dúvidas ou problemas técnicos (login, sistema fora do ar), entre em contato com o suporte técnico do Lar do Alvorecer.
