# Formulário de Inscrição CECOR 2025

Este projeto é uma aplicação React que implementa um formulário de inscrição moderno e responsivo para os cursos do CECOR.

## Características

- Interface moderna e responsiva
- Navegação intuitiva entre seções do formulário
- Validação em tempo real dos campos
- Suporte para perguntas condicionais
- Visualização clara do progresso
- Resumo final para confirmação antes do envio
- Compatibilidade com dispositivos móveis

## Tecnologias Utilizadas

- React 18
- React Router v6
- CSS moderno (com variáveis CSS)
- Context API para gerenciamento de estado

## Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── contexts/          # Context API para gerenciamento de estado
├── pages/             # Páginas do formulário
├── styles/            # Arquivos CSS para estilização
├── App.js             # Componente principal
└── index.js           # Ponto de entrada
```

## Páginas do Formulário

1. **Boas-vindas**: Tela inicial com instruções
2. **Seleção de Cursos**: Escolha dos cursos de interesse organizados por horário
3. **Dados Pessoais**: Informações básicas do aluno
4. **Dados Familiares**: Informações sobre responsáveis
5. **Informações Adicionais**: Perguntas sobre trabalho, estudo e expectativas
6. **Confirmação**: Resumo das informações para verificação
7. **Sucesso**: Confirmação de inscrição realizada

## Instalação e Execução

### Pré-requisitos

- Node.js 14.x ou superior
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/cecor-form.git
cd cecor-form
```

2. Instale as dependências:
```
npm install
# ou
yarn install
```

3. Execute o projeto em modo de desenvolvimento:
```
npm start
# ou
yarn start
```

4. O aplicativo será aberto automaticamente em `http://localhost:3000`

## Personalização

- Cores e estilo: Edite as variáveis CSS em `src/styles/App.css`
- Listas de cursos: Modifique os dados em `src/pages/CourseSelection.js`
- Textos: Altere os textos diretamente nos componentes em `src/pages/`

## Implementação

Para usar este formulário em produção:

1. Configure um backend para receber os dados do formulário
2. Ajuste o método `handleSubmit` em `src/pages/Confirmation.js` para enviar os dados para seu backend
3. Execute `npm run build` para gerar uma versão otimizada para produção
4. Faça o deploy dos arquivos da pasta `build/` para seu servidor web

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, entre em contato com [seu-email@example.com](mailto:seu-email@example.com).