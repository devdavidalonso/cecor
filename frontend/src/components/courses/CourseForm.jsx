import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const CourseForm = ({
  course = null,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workload: '',
    max_students: '',
    week_days: '',
    start_time: '',
    end_time: '',
    duration: '',
  });
  
  const [errors, setErrors] = useState({});

  // Preencher o formulário com os dados do curso se estiver editando
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
        workload: course.workload?.toString() || '',
        max_students: course.max_students?.toString() || '',
        week_days: course.week_days || '',
        start_time: course.start_time || '',
        end_time: course.end_time || '',
        duration: course.duration?.toString() || '',
      });
    }
  }, [course]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Nome do curso é obrigatório';
    }
    
    if (!formData.workload) {
      newErrors.workload = 'Carga horária é obrigatória';
    } else if (isNaN(formData.workload) || parseInt(formData.workload) <= 0) {
      newErrors.workload = 'Carga horária deve ser um número positivo';
    }
    
    if (!formData.max_students) {
      newErrors.max_students = 'Número máximo de alunos é obrigatório';
    } else if (isNaN(formData.max_students) || parseInt(formData.max_students) <= 0) {
      newErrors.max_students = 'Número máximo de alunos deve ser um número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Converter campos numéricos
    const formattedData = {
      ...formData,
      workload: parseInt(formData.workload),
      max_students: parseInt(formData.max_students),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        type="text"
        label="Nome do Curso"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        disabled={loading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="workload"
          name="workload"
          type="number"
          label="Carga Horária (horas)"
          value={formData.workload}
          onChange={handleChange}
          error={errors.workload}
          required
          disabled={loading}
          min="1"
        />
        
        <Input
          id="max_students"
          name="max_students"
          type="number"
          label="Número Máximo de Alunos"
          value={formData.max_students}
          onChange={handleChange}
          error={errors.max_students}
          required
          disabled={loading}
          min="1"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="start_time"
          name="start_time"
          type="time"
          label="Horário de Início"
          value={formData.start_time}
          onChange={handleChange}
          error={errors.start_time}
          disabled={loading}
        />
        
        <Input
          id="end_time"
          name="end_time"
          type="time"
          label="Horário de Término"
          value={formData.end_time}
          onChange={handleChange}
          error={errors.end_time}
          disabled={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="week_days"
          name="week_days"
          type="text"
          label="Dias da Semana (1-7, separados por vírgula)"
          placeholder="Ex: 1,3,5 (Seg, Qua, Sex)"
          value={formData.week_days}
          onChange={handleChange}
          error={errors.week_days}
          disabled={loading}
        />
        
        <Input
          id="duration"
          name="duration"
          type="number"
          label="Duração (semanas)"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          disabled={loading}
          min="1"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição do Curso
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Descreva o curso, objetivos e público alvo"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
          {course ? 'Atualizar Curso' : 'Criar Curso'}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;