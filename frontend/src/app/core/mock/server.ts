// src/app/core/mock/server.ts
import { createServer, Model, Factory, Response, ActiveModelSerializer } from 'miragejs';
import { environment } from '../../../environments/environment';

// Importar dados mockados
import { MOCK_CURSOS } from './data/mock-cursos';
import { MOCK_CAROUSEL_ITEMS } from './data/mock-carousel-items';

// Adicionar propriedade server ao objeto Window
declare global {
  interface Window {
    server: any;
  }
}

export function setupMirageServer() {
  // Encerrar servidor existente, se houver
  if (window.server) {
    window.server.shutdown();
  }
  
  window.server = createServer({
    serializers: {
      application: ActiveModelSerializer,
    },
    
    models: {
      curso: Model,
      carouselItem: Model,
    },
    
    factories: {
      curso: Factory.extend({
        nome(i) { return `Curso ${i+1}`; },
        descricaoResumida() { return 'Descrição resumida do curso'; },
        descricaoDetalhada() { return 'Descrição detalhada do curso...'; },
        cargaHoraria() { return 40; },
        numeroMaximoAlunos() { return 20; },
        diasSemanais() { return 'Segunda, Quarta e Sexta'; },
        horarioInicio() { return '09:00'; },
        horarioFim() { return '11:00'; },
        duracao() { return 10; },
        status() { return 'ativo'; },
      }),
      
      carouselItem: Factory.extend({
        imageUrl() { return 'assets/images/carousel/default.jpg'; },
        title() { return 'Título do Slide'; },
        description() { return 'Descrição do slide do carrossel'; },
        order(i) { return i+1; },
        active() { return true; },
      }),
    },
    
    seeds(server) {
      // Semear o banco de dados com dados mockados
      MOCK_CURSOS.forEach(curso => {
        server.create('curso', {
          ...curso,
          id: curso.id.toString() // Converte o id para string
        });
      });
      
      MOCK_CAROUSEL_ITEMS.forEach(item => {
        server.create('carouselItem', {
          ...item,
          id: item.id.toString() // Converte o id para string
        });
      });
    },
    
    routes() {
      // Definir namespace da API
      this.namespace = 'api/v1';
      
      // Rotas para cursos
      this.get('/cursos', (schema, request) => {
        const { queryParams } = request;
        // Correção: Valores padrão e conversão segura para números
        const pageParam = queryParams['page'] || '1';
        const pageSizeParam = queryParams['pageSize'] || '20';
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : 20;
        const search = queryParams['search'];
        
        const cursos = schema.all('curso').models;
        
        // Filtrar por termo de pesquisa, se fornecido
        let filteredCursos = cursos;
        if (search) {
          // Correção: Verificação segura para string
          const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
          filteredCursos = cursos.filter((curso) => {
            // Correção: Uso de type assertion para garantir acesso a propriedades
            const cursoAttrs = curso.attrs as any;
            return cursoAttrs.nome.toLowerCase().includes(searchLower) || 
                  cursoAttrs.descricaoResumida.toLowerCase().includes(searchLower) ||
                  (cursoAttrs.tags && Array.isArray(cursoAttrs.tags) && 
                  cursoAttrs.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)));
          });
        }
        
        // Obter configurações de simulação do localStorage
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const simulateErrors = localStorage.getItem('prototype_simulate_errors') === 'true';
        
        // Chance de erro (20% se simulateErrors estiver ativado)
        if (simulateErrors && Math.random() < 0.2) {
          return new Response(
            500,
            { 'Content-Type': 'application/json' },
            { error: 'Erro simulado no servidor para testar o tratamento de erros do frontend' }
          );
        }
        
        // Paginação
        // Correção: Uso dos valores já convertidos para número
        const start = (parsedPage - 1) * parsedPageSize;
        const end = Math.min(start + parsedPageSize, filteredCursos.length);
        const paginatedCursos = filteredCursos.slice(start, end);
        
        // Formatar resposta com paginação
        const response = {
          data: paginatedCursos.map(c => c.attrs),
          page: parsedPage,
          pageSize: parsedPageSize,
          totalItems: filteredCursos.length,
          totalPages: Math.ceil(filteredCursos.length / parsedPageSize)
        };
        
        // Simular delay de rede
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;
        
        // Correção: Usar o quarto parâmetro para timing
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          response         
        );
      });
      
      // Obter curso por ID
      this.get('/cursos/:id', (schema, request) => {
        // Correção: Acesso seguro ao parâmetro ID
        const id = request.params['id'];
        const curso = schema.find('curso', id);
        
        // Simular delay de rede
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;
        
        // Simular erros
        const simulateErrors = localStorage.getItem('prototype_simulate_errors') === 'true';
        if (simulateErrors && Math.random() < 0.2) {
          return new Response(
            500,
            { 'Content-Type': 'application/json' },
            { error: 'Erro simulado ao buscar curso' }
          );
        }
        
        // Correção: Usar o quarto parâmetro para timing
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          curso ? curso.attrs : { error: 'Curso não encontrado' }          
        );
      });
      
      // Rotas para busca de cursos
      // Correção: Criar um handler próprio para a busca
      this.get('/cursos/search', (schema, request) => {
        // Reutilizar a mesma lógica da rota /cursos
        const { queryParams } = request;
        const pageParam = queryParams['page'] || '1';
        const pageSizeParam = queryParams['pageSize'] || '20';
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : 20;
        const search = queryParams['search'];
        
        const cursos = schema.all('curso').models;
        
        // Filtrar por termo de pesquisa, se fornecido
        let filteredCursos = cursos;
        if (search) {
          const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
          filteredCursos = cursos.filter((curso) => {
            const cursoAttrs = curso.attrs as any;
            return cursoAttrs.nome.toLowerCase().includes(searchLower) || 
                  cursoAttrs.descricaoResumida.toLowerCase().includes(searchLower) ||
                  (cursoAttrs.tags && Array.isArray(cursoAttrs.tags) && 
                  cursoAttrs.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)));
          });
        }
        
        // Simular delay e restante da lógica...
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;
        
        const start = (parsedPage - 1) * parsedPageSize;
        const end = Math.min(start + parsedPageSize, filteredCursos.length);
        const paginatedCursos = filteredCursos.slice(start, end);
        
        const response = {
          data: paginatedCursos.map(c => c.attrs),
          page: parsedPage,
          pageSize: parsedPageSize,
          totalItems: filteredCursos.length,
          totalPages: Math.ceil(filteredCursos.length / parsedPageSize)
        };
        
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          response,          
        );
      });
      
      // Rotas para o carrossel
      this.get('/carousel', (schema, request) => {
        const items = schema.all('carouselItem').models;
        
        // Ordenar por ordem
        const sortedItems = items.sort((a, b) => {
          const orderA = a.attrs.order !== undefined ? a.attrs.order : 0;
          const orderB = b.attrs.order !== undefined ? b.attrs.order : 0;
          return orderA - orderB;
        });
        
        // Filtrar apenas ativos
        const activeItems = sortedItems.filter(item => item.attrs.active);
        
        // Simular delay de rede
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;
        
        // Simular erros
        const simulateErrors = localStorage.getItem('prototype_simulate_errors') === 'true';
        if (simulateErrors && Math.random() < 0.2) {
          return new Response(
            500,
            { 'Content-Type': 'application/json' },
            { error: 'Erro simulado ao buscar itens do carrossel' }
          );
        }
        
        // Correção: Usar o quarto parâmetro para timing
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          activeItems.map(item => item.attrs),
        );
      });
      
      // Definir passthrough para endpoints que não queremos interceptar
      this.passthrough();
    }
  });
  
  return window.server;
}