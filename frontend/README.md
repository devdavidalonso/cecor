# Frontend do Sistema de Gestão Educacional CECOR

Este é o frontend do Sistema de Gestão Educacional CECOR, uma aplicação web desenvolvida em Angular para gerenciar alunos, cursos, matrículas, presenças, relatórios e entrevistas.

## Tecnologias Utilizadas

- Angular 17+ com padrão Standalone Components
- Angular Material para componentes de UI
- RxJS para programação reativa e gerenciamento de estado
- Progressive Web App (PWA) para suporte offline
- Jasmine e Karma para testes unitários
- Cypress para testes E2E

## Pré-requisitos

- Node.js 18.x ou superior
- NPM 9.x ou superior
- Angular CLI 17.x ou superior

## Configuração do Ambiente de Desenvolvimento

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cecor.git
cd cecor/frontend
```

2. Instale as dependências:
```bash
npm install
```

### Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200/`.

### Configuração de Proxy

Por padrão, o frontend está configurado para redirecionar requisições da API para o backend em `http://localhost:8080/api`. Essa configuração está no arquivo `src/proxy.conf.json`.

### Construindo para Produção

```bash
npm run build
```

Os arquivos compilados serão armazenados no diretório `dist/`. Use a flag `--prod` para uma build de produção.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # Serviços singleton, guards, interceptors
│   │   │   ├── guards/           # Guards para proteção de rotas
│   │   │   ├── interceptors/     # Interceptors HTTP
│   │   │   ├── models/           # Interfaces e tipos
│   │   │   └── services/         # Serviços globais
│   │   │
│   │   ├── features/             # Módulos de funcionalidade (lazy-loaded)
│   │   │   ├── administracao/    # Módulo de administração
│   │   │   ├── alunos/           # Módulo de alunos
│   │   │   ├── auth/             # Módulo de autenticação
│   │   │   ├── cursos/           # Módulo de cursos
│   │   │   ├── dashboard/        # Módulo de dashboard
│   │   │   ├── entrevistas/      # Módulo de entrevistas
│   │   │   ├── matriculas/       # Módulo de matrículas
│   │   │   ├── presencas/        # Módulo de presenças
│   │   │   ├── relatorios/       # Módulo de relatórios
│   │   │   └── voluntariado/     # Módulo de voluntariado
│   │   │
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── footer/           # Componente de footer
│   │   │   ├── header/           # Componente de header
│   │   │   ├── sidebar/          # Componente de sidebar
│   │   │   └── layout.component.ts # Componente principal de layout
│   │   │
│   │   ├── shared/               # Componentes, pipes, diretivas compartilhadas
│   │   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── directives/       # Diretivas customizadas
│   │   │   └── pipes/            # Pipes customizados
│   │   │
│   │   ├── app.component.ts      # Componente raiz
│   │   ├── app.config.ts         # Configuração da aplicação
│   │   └── app.routes.ts         # Rotas principais da aplicação
│   │
│   ├── assets/                   # Recursos estáticos
│   │   ├── i18n/                 # Arquivos de internacionalização
│   │   ├── icons/                # Ícones para PWA
│   │   └── images/               # Imagens
│   │
│   ├── environments/             # Configurações de ambiente
│   │   ├── environment.ts        # Configuração padrão
│   │   └── environment.development.ts # Configuração de desenvolvimento
│   │
│   ├── manifest.webmanifest      # Manifesto para PWA
│   ├── styles.scss               # Estilos globais
│   └── index.html                # HTML principal
│
├── angular.json                  # Configuração do Angular
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configuração do TypeScript
├── proxy.conf.json               # Configuração de proxy para desenvolvimento
└── README.md                     # Este arquivo
```

## Arquitetura

O frontend segue os princípios de arquitetura de componentes do Angular 17+, com ênfase em Standalone Components. Principais pontos:

### Estrutura de Módulos

- **Lazy Loading**: Todos os módulos de funcionalidade são carregados sob demanda (lazy loading)
- **Standalone Components**: Uso de componentes independentes para maior reutilização
- **Core Module**: Contém serviços singleton e lógica central da aplicação
- **Shared Module**: Contém componentes e utilitários compartilhados

### Gerenciamento de Estado

- Serviços com RxJS: Uso de BehaviorSubject para gerenciamento local de estado
- HttpClient: Para comunicação com a API
- Interceptors: Para manipulação global de requisições e respostas HTTP (autenticação, tratamento de erros)

### Autenticação

- JWT (JSON Web Tokens): Para autenticação baseada em tokens
- AuthGuard: Para proteção de rotas
- Token Refresh: Renovação automática de tokens expirados

### Testes

- Jasmine/Karma: Para testes unitários
- Cypress: Para testes de integração e E2E

## Rotas Principais

- `/`: Redirecionamento para o dashboard
- `/auth/login`: Página de login
- `/dashboard`: Dashboard principal
- `/alunos`: Gestão de alunos
- `/cursos`: Gestão de cursos
- `/matriculas`: Gestão de matrículas
- `/presencas`: Registro e controle de presença
- `/relatorios`: Relatórios e análises
- `/entrevistas`: Gestão de entrevistas
- `/voluntariado`: Gestão de termos de voluntariado
- `/administracao`: Funções administrativas (somente para administradores)

## Perfis de Usuário

A interface se adapta dinamicamente ao perfil do usuário logado:

- **Administrador**: Acesso completo a todas as funcionalidades
- **Gestor**: Acesso a gerenciamento de alunos, cursos e relatórios
- **Professor**: Acesso a listas de presença e acompanhamento de alunos
- **Aluno**: Visualização de informações pessoais e frequência
- **Responsável**: Visualização de informações do aluno vinculado

## Comandos Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run watch`: Compila em modo observador para desenvolvimento
- `npm test`: Executa testes unitários
- `npm run e2e`: Executa testes end-to-end com Cypress
- `npm run lint`: Executa análise de código com ESLint

## PWA (Progressive Web App)

A aplicação é configurada como uma PWA, permitindo:

- Instalação em dispositivos móveis e desktop
- Funcionamento offline para algumas funcionalidades
- Cache de recursos estáticos
- Atualizações automáticas quando novas versões são publicadas

## Estilo e Design

O sistema utiliza Angular Material com uma personalização leve para atender à identidade visual do CECOR. Os principais estilos globais estão definidos em `src/styles.scss`, incluindo:

- Paleta de cores personalizada
- Utilitários de espaçamento (margin, padding)
- Classes de flexbox
- Utilitários de texto
- Responsividade (incluindo classes específicas para breakpoints)

## Docker

Para executar o frontend em um contêiner Docker:

```bash
# Construir a imagem
docker build -t cecor-frontend .

# Executar o contêiner
docker run -p 80:80 cecor-frontend
```

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
2. Commit suas alterações: `git commit -m 'feat: adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

Por favor, certifique-se de que seus commits sigam a convenção de [Conventional Commits](https://www.conventionalcommits.org/).

## Boas Práticas

- Siga o [Angular Style Guide](https://angular.io/guide/styleguide)
- Mantenha os componentes pequenos e focados em uma única responsabilidade
- Use Reactive Forms para formulários complexos
- Escreva testes unitários para serviços e componentes
- Documente código complexo e regras de negócio importantes
- Use lazy loading para otimizar a performance inicial
- Siga convenções de nomenclatura consistentes