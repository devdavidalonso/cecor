// Script para inicializar o MongoDB com coleções e documentos iniciais

// Conectar ao banco de dados
db = db.getSiblingDB('cecor_flexible_data');

// Criar coleções
db.createCollection('entrevistas');
db.createCollection('formularios');
db.createCollection('respostas');
db.createCollection('documentos');
db.createCollection('audit_logs');

// Inserir um formulário de exemplo
db.formularios.insertOne({
  titulo: "Entrevista Inicial",
  descricao: "Formulário de entrevista para novos alunos",
  tipo: "entrevista",
  obrigatorio: true,
  publicoAlvo: "aluno",
  status: "ativo",
  criadoPor: "admin",
  criadoEm: new Date(),
  perguntas: [
    {
      id: 1,
      textoPergunta: "Como você conheceu o CECOR?",
      tipoPergunta: "texto",
      obrigatoria: true,
      ordemExibicao: 1
    },
    {
      id: 2,
      textoPergunta: "Já participou de algum curso anteriormente?",
      tipoPergunta: "booleano",
      obrigatoria: true,
      ordemExibicao: 2
    },
    {
      id: 3,
      textoPergunta: "Quais cursos?",
      tipoPergunta: "texto",
      obrigatoria: false,
      ordemExibicao: 3,
      perguntaPaiId: 2,
      valorCondicional: true
    },
    {
      id: 4,
      textoPergunta: "Qual seu objetivo ao participar deste curso?",
      tipoPergunta: "escolha_multipla",
      obrigatoria: true,
      ordemExibicao: 4,
      opcoes: [
        "Capacitação profissional",
        "Desenvolvimento pessoal",
        "Interesse no tema",
        "Recomendação de amigos",
        "Outro"
      ]
    },
    {
      id: 5,
      textoPergunta: "Por favor, especifique:",
      tipoPergunta: "texto",
      obrigatoria: false,
      ordemExibicao: 5,
      perguntaPaiId: 4,
      valorCondicional: "Outro"
    }
  ]
});

// Inserir um modelo de documento
db.documentos.insertOne({
  tipo: "termo_compromisso",
  nome: "Termo de Compromisso - Modelo Padrão",
  descricao: "Termo de compromisso padrão para alunos",
  conteudo: "<h1>TERMO DE COMPROMISSO</h1><p>Eu, {nome_aluno}, inscrito no CPF {cpf_aluno}, me comprometo a seguir as normas e regras do curso {nome_curso}, comparecendo às aulas, realizando as atividades propostas e mantendo conduta adequada durante todo o período de realização do curso.</p><p>Data: {data}</p><p>Assinatura: _________________________</p>",
  variaveis: ["nome_aluno", "cpf_aluno", "nome_curso", "data"],
  criadoPor: "admin",
  criadoEm: new Date(),
  ativo: true
});

// Inserir registro de auditoria inicial
db.audit_logs.insertOne({
  tipoEntidade: "sistema",
  entidadeId: null,
  acao: "inicializacao",
  usuarioId: "sistema",
  data: new Date(),
  detalhes: "Inicialização do banco de dados MongoDB"
});

// Mensagem de sucesso
print("Inicialização do MongoDB concluída com sucesso!");