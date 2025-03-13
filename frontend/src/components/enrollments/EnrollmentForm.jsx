import { useState, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';
import Input from '../common/Input';
import Button from '../common/Button';

const EnrollmentForm = ({
  users = [],
  courses = [],
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
  });
  
  const [errors, setErrors] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [filteredCourses, setFilteredCourses] = useState(courses);

  // Filtrar usuários quando o termo de busca mudar
  useEffect(() => {
    if (userSearch) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearch, users]);

  // Filtrar cursos quando o termo de busca mudar
  useEffect(() => {
    if (courseSearch) {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(courseSearch.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [courseSearch, courses]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.user_id) {
      newErrors.user_id = 'É necessário selecionar um aluno';
    }
    
    if (!formData.course_id) {
      newErrors.course_id = 'É necessário selecionar um curso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => ({ ...prev, user_id: userId }));
    setUserSearch('');
    
    // Limpar erro se existir
    if (errors.user_id) {
      setErrors(prev => ({ ...prev, user_id: undefined }));
    }
  };

  const handleCourseSelect = (courseId) => {
    setFormData(prev => ({ ...prev, course_id: courseId }));
    setCourseSearch('');
    
    // Limpar erro se existir
    if (errors.course_id) {
      setErrors(prev => ({ ...prev, course_id: undefined }));
    }
  };

  // Encontrar usuário e curso selecionados
  const selectedUser = users.find(user => user.id === parseInt(formData.user_id));
  const selectedCourse = courses.find(course => course.id === parseInt(formData.course_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleção de Aluno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aluno <span className="text-red-500">*</span>
        </label>
        
        {selectedUser ? (
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">{selectedUser.name}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormData(prev => ({ ...prev, user_id: '' }))}
              disabled={loading}
            >
              Alterar
            </Button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Input
                id="userSearch"
                name="userSearch"
                type="text"
                placeholder="Buscar aluno por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pr-10"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
            )}
            
            {userSearch && filteredUsers.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Seleção de Curso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Curso <span className="text-red-500">*</span>
        </label>
        
        {selectedCourse ? (
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">{selectedCourse.name}</p>
              <p className="text-sm text-gray-500">{selectedCourse.workload}h | Vagas: {selectedCourse.max_students}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormData(prev => ({ ...prev, course_id: '' }))}
              disabled={loading}
            >
              Alterar
            </Button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Input
                id="courseSearch"
                name="courseSearch"
                type="text"
                placeholder="Buscar curso por nome..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pr-10"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {errors.course_id && (
              <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
            )}
            
            {courseSearch && filteredCourses.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                <ul className="divide-y divide-gray-200">
                  {filteredCourses.map(course => (
                    <li 
                      key={course.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCourseSelect(course.id)}
                    >
                      <p className="font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">
                        {course.workload}h | Vagas: {course.max_students}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
        >
          Criar Matrícula
        </Button>
      </div>
    </form>
  );
};

export default EnrollmentForm;