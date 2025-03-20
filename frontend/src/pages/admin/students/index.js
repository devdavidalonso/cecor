// src/pages/admin/students/index.js (Parte 1)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiPlus, FiFilter, FiDownload, FiSearch } from 'react-icons/fi';
import Layout from '../../../components/common/Layout';
import StudentList from '../../../components/students/StudentList';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { studentService } from '../../../lib/api';

export default function StudentsPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { showAlert, error: showError } = useAlert();
  const router = useRouter();
  
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageGroup: '',
    courseId: '',
    enrollmentStatus: '',
  });
  
  // Verificar autenticação
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/login');
    } else if (!loading && isAuthenticated() && !isAdmin()) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isAdmin, loading, router]);
  
  // Carregar dados dos alunos
  const loadStudents = async (page = 1, search = '', filters = {}) => {
    try {
      setIsLoading(true);
      
      const response = await studentService.searchStudents({
        page,
        pageSize,
        search,
        ...filters
      });
      
      const data = response.data || response;
      
      setStudents(data.items || data);
      setTotalStudents(data.totalCount || data.length);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      showError('Erro ao carregar lista de alunos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar alunos ao montar o componente
  useEffect(() => {
    if (isAuthenticated() && !loading) {
      loadStudents(currentPage, searchTerm, filters);
    }
  }, [isAuthenticated, loading]); // eslint-disable-line react-hooks/exhaustive-deps
  // src/pages/admin/students/index.js (Parte 2)
  
  // Lida com a mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadStudents(page, searchTerm, filters);
  };
  
  // Lida com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStudents(1, searchTerm, filters);
  };
  
  // Lida com a mudança de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Aplica filtros
  const applyFilters = () => {
    setCurrentPage(1);
    loadStudents(1, searchTerm, filters);
    setShowFilters(false);
  };
  
  // Reseta filtros
  const resetFilters = () => {
    setFilters({
      ageGroup: '',
      courseId: '',
      enrollmentStatus: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
    loadStudents(1, '', {});
    setShowFilters(false);
  };
  
  // Exporta dados para CSV
  const exportToCSV = async () => {
    try {
      const response = await studentService.exportStudents({
        format: 'csv',
        search: searchTerm,
        ...filters
      });
      
      // Criar um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alunos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      showAlert('Lista de alunos exportada com sucesso!', 'success');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Erro ao exportar alunos:', error);
      showError('Erro ao exportar lista de alunos.');
    }
  };
  
  // Exporta dados para Excel
  const exportToExcel = async () => {
    try {
      const response = await studentService.exportStudents({
        format: 'excel',
        search: searchTerm,
        ...filters
      });
      
      // Criar um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alunos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      showAlert('Lista de alunos exportada com sucesso!', 'success');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Erro ao exportar alunos:', error);
      showError('Erro ao exportar lista de alunos.');
    }
  };
  
  // Exporta dados para PDF
  const exportToPDF = async () => {
    try {
      const response = await studentService.exportStudents({
        format: 'pdf',
        search: searchTerm,
        ...filters
      });
      
      // Criar um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alunos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      showAlert('Lista de alunos exportada com sucesso!', 'success');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Erro ao exportar alunos:', error);
      showError('Erro ao exportar lista de alunos.');
    }
  };
  // src/pages/admin/students/index.js (Parte 3)
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>Gestão de Alunos | Sistema Educacional</title>
        <meta name="description" content="Gerencie todos os alunos do sistema educacional" />
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        {/* Cabeçalho da página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Alunos</h1>
            <p className="mt-1 text-sm text-gray-600">
              Total de {totalStudents} aluno{totalStudents !== 1 ? 's' : ''} cadastrado{totalStudents !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Link
              href="/admin/students/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2" />
              Novo Aluno
            </Link>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFilter className="mr-2" />
              Filtros
            </button>
            
            <div className="relative">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <FiDownload className="mr-2" />
                Exportar
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={exportToCSV}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar CSV
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Formulário de pesquisa */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF ou email..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FiSearch />
            </button>
          </div>
        </form>
        
        {/* Área de filtros avançados */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-4">Filtros Avançados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Faixa Etária
                </label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={filters.ageGroup}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="0-12">Até 12 anos</option>
                  <option value="13-17">13 a 17 anos</option>
                  <option value="18+">18 anos ou mais</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={filters.courseId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {/* Aqui você deve mapear os cursos disponíveis */}
                </select>
              </div>
              
              <div>
                <label htmlFor="enrollmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status de Matrícula
                </label>
                <select
                  id="enrollmentStatus"
                  name="enrollmentStatus"
                  value={filters.enrollmentStatus}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativa</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Limpar
              </button>
              
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
        
        {/* Lista de alunos principal */}
        <StudentList 
          students={students}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onDeleteSuccess={() => loadStudents(currentPage, searchTerm, filters)}
        />
      </div>
    </Layout>
  );
}