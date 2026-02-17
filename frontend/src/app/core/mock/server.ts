// src/app/core/mock/server.ts
import { createServer, Model, Factory, Response } from 'miragejs';
import { environment } from '../../../environments/environment';
import { MOCK_COURSES } from './data/mock-courses';
import { MOCK_CAROUSEL_ITEMS } from './data/mock-carousel-items';

// Estender a interface Window para incluir server
declare global {
  interface Window {
    server: any;
  }
}

export function setupMirageServer() {
  if (window.server) {
    window.server.shutdown();
  }

  window.server = createServer({
    models: {
      course: Model,
      carouselItem: Model,
    },
    factories: {
      course: Factory.extend({
        name(i: number) {
          return `Course ${i + 1}`;
        },
        shortDescription() {
          return 'Course short description';
        },
        detailedDescription() {
          return 'Detailed course description with more information...';
        },
        workload() {
          return 40;
        },
        maxStudents() {
          return 30;
        },
        weekDays() {
          return 'Mon, Wed, Fri';
        },
        startTime() {
          return '19:00';
        },
        endTime() {
          return '22:00';
        },
        duration() {
          return 6;
        },
        status() {
          return 'active';
        },
        teacherId() {
          return 1;
        },
        tags() {
          return [];
        },
      }),
      carouselItem: Factory.extend({
        imageUrl() { return 'assets/images/carousel/default.jpg'; },
        title() { return 'Slide Title'; },
        description() { return 'Carousel slide description'; },
        order(i: number) { return i + 1; },
        active() { return true; },
      }),
    },
    seeds(server) {
      // Inserir dados mockados dos cursos
      MOCK_COURSES.forEach((course: any) => {
        server.create('course', {
          ...course,
          id: course.id ? course.id.toString() : undefined
        });
      });

      // Inserir dados mockados do carrossel
      MOCK_CAROUSEL_ITEMS.forEach((item: any) => {
        server.create('carouselItem', item);
      });
    },
    routes() {
      // Definir namespace para as rotas da API
      this.namespace = environment.apiUrl.replace(/.*\/\/[^/]+/, '');

      // Rotas para cursos
      this.get('/courses', (schema, request) => {
        const { queryParams } = request;
        const pageParam = queryParams['page'] || '1';
        const pageSizeParam = queryParams['pageSize'] || '20';
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : 20;

        const courses = schema.all('course').models;
        const start = (parsedPage - 1) * parsedPageSize;
        const end = Math.min(start + parsedPageSize, courses.length);
        const paginatedCourses = courses.slice(start, end);

        // Simular delay de rede
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;

        // Simular erros
        const simulateErrors = localStorage.getItem('prototype_simulate_errors') === 'true';
        if (simulateErrors && Math.random() < 0.2) {
          return new Response(
            500,
            { 'Content-Type': 'application/json' },
            { error: 'Erro simulado ao buscar cursos' }
          );
        }

        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          {
            data: paginatedCourses.map((c: any) => c.attrs),
            page: parsedPage,
            pageSize: parsedPageSize,
            totalItems: courses.length,
            totalPages: Math.ceil(courses.length / parsedPageSize)
          }
        );
      });

      // Obter course por ID
      this.get('/courses/:id', (schema, request) => {
        const id = request.params['id'];
        const course = schema.find('course', id);

        // Simular delay de rede
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;

        // Simular erros
        const simulateErrors = localStorage.getItem('prototype_simulate_errors') === 'true';
        if (simulateErrors && Math.random() < 0.2) {
          return new Response(
            500,
            { 'Content-Type': 'application/json' },
            { error: 'Erro simulado ao buscar course' }
          );
        }

        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          course ? course.attrs : { error: 'Course não encontrado' }
        );
      });

      // Rotas para busca de cursos
      this.get('/courses/search', (schema, request) => {
        const { queryParams } = request;
        const pageParam = queryParams['page'] || '1';
        const pageSizeParam = queryParams['pageSize'] || '20';
        const parsedPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
        const parsedPageSize = typeof pageSizeParam === 'string' ? parseInt(pageSizeParam, 10) : 20;
        const search = queryParams['search'];

        const courses = schema.all('course').models;

        // Filtrar por termo de pesquisa, se fornecido
        let filteredCourses = courses;
        if (search) {
          const searchLower = typeof search === 'string' ? search.toLowerCase() : '';
          filteredCourses = courses.filter((course: any) => {
            const courseAttrs = course.attrs;
            return courseAttrs.name?.toLowerCase().includes(searchLower) ||
              courseAttrs.shortDescription?.toLowerCase().includes(searchLower) ||
              (courseAttrs.tags && Array.isArray(courseAttrs.tags) &&
                courseAttrs.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)));
          });
        }

        // Simular delay de rede
        const networkDelayStr = localStorage.getItem('prototype_network_delay');
        const delay = networkDelayStr ? parseInt(networkDelayStr, 10) : 500;

        const start = (parsedPage - 1) * parsedPageSize;
        const end = Math.min(start + parsedPageSize, filteredCourses.length);
        const paginatedCourses = filteredCourses.slice(start, end);

        const response = {
          data: paginatedCourses.map((c: any) => c.attrs),
          page: parsedPage,
          pageSize: parsedPageSize,
          totalItems: filteredCourses.length,
          totalPages: Math.ceil(filteredCourses.length / parsedPageSize)
        };

        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          response
        );
      });

      // Rotas para o carrossel
      this.get('/carousel', (schema, request) => {
        const items = schema.all('carouselItem').models;

        // Ordenar por ordem
        const sortedItems = items.sort((a: any, b: any) => {
          const orderA = a.attrs.order !== undefined ? a.attrs.order : 0;
          const orderB = b.attrs.order !== undefined ? b.attrs.order : 0;
          return orderA - orderB;
        });

        // Filtrar apenas ativos
        const activeItems = sortedItems.filter((item: any) => item.attrs.active);

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

        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          activeItems.map((item: any) => item.attrs)
        );
      });

      // Definir passthrough para endpoints que não queremos interceptar
      this.passthrough('http://localhost:8081/**');
      this.passthrough();
    }
  });

  return window.server;
}
