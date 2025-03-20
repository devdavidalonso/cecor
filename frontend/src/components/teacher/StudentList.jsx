// src/components/teacher/StudentList.jsx (Parte 1)
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEye, FiSearch, FiFilter, FiMail, FiPhone } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { studentService, courseService } from '../../lib/api';

const TeacherStudentList = ({ courseId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    ageGroup: '',
    statusFilter: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [courseData, setCourseData] = useState(null);
  
  const { showAlert, error: showError } = useAlert();
  
  // Carregar alunos do curso
  const loadStudents = async (courseId, search = '', filters = {}) => {
    try {
      setLoading(true);
      
      // Primeiro, carregar os dados do curso
      if (!courseData) {
        const courseResponse = await courseService.getCourseById(courseId);
        setCourseData(courseResponse.data || courseResponse);
      }
      
      // Carregar alunos matriculados no curso
      const response = await studentService.getStudentsByCourse(courseId, {
        search,
        ...filters
      });
      
      const data = response.data || response;
      setStudents(data);
    } catch (error) {
      console.error('Erro ao carregar alunos do curso:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao carregar lista de alunos.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar alunos ao montar o componente
  useEffect(() => {
    if (courseId) {
      loadStudents(courseId);
    }
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Lida com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents(courseId, searchTerm, filters);
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
    loadStudents(courseId, searchTerm, filters);
    setShowFilters(false);
  };
  
  // Reseta filtros
  const resetFilters = () => {
    setFilters({
      ageGroup: '',
      statusFilter: ''
    });
    setSearchTerm('');
    loadStudents(courseId, '', {});
    setShowFilters(false);
  };
  
  // Formata data no padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Calcula idade a partir da data de nascimento
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  // src/components/teacher/StudentList.jsx (Parte 2)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Alunos do Curso</h2>
          {courseData && (
            <p className="text-gray-600 mt-1">{courseData.name}</p>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiFilter className="mr-2" />
            Filtros
          </button>
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
          <h3 className="text-lg font-medium mb-4">Filtros</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status da Matrícula
              </label>
              <select
                id="statusFilter"
                name="statusFilter"
                value={filters.statusFilter}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Ativa</option>
                <option value="completed">Concluída</option>
                <option value="paused">Pausada</option>
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
      // src/components/teacher/StudentList.jsx (Parte 3)
      
      {/* Lista de alunos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum aluno encontrado neste curso.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.photoUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.photoUrl}
                                alt={`Foto de ${student.fullName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {student.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Matrícula: {student.enrollmentCode || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.age || calculateAge(student.birthDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(student.birthDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiPhone className="mr-1 text-gray-400" />
                          {student.mainPhone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiMail className="mr-1 text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.guardians && student.guardians.length > 0
                            ? student.guardians[0].fullName
                            : 'Não informado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.guardians && student.guardians.length > 0
                            ? student.guardians[0].phone1
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.status === 'active' ? 'bg-green-100 text-green-800' :
                            student.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            student.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.status === 'active' ? 'Ativa' :
                           student.status === 'completed' ? 'Concluída' :
                           student.status === 'paused' ? 'Pausada' :
                           'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="inline-block" /> Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherStudentList;