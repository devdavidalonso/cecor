import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Matricula = () => {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    aluno_id: '',
    curso_id: '',
    data_matricula: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscar alunos e cursos simultaneamente
        const [alunosRes, cursosRes] = await Promise.all([
          fetch('http://localhost:8080/api/alunos'),
          fetch('http://localhost:8080/api/cursos')
        ]);

        if (!alunosRes.ok || !cursosRes.ok) {
          throw new Error('Erro ao buscar dados');
        }

        const alunosData = await alunosRes.json();
        const cursosData = await cursosRes.json();

        setAlunos(alunosData);
        setCursos(cursosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Não foi possível carregar os dados necessários. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.aluno_id || !formData.curso_id) {
      setError('Por favor, selecione um aluno e um curso.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:8080/api/matriculas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao realizar matrícula');
      }

      const result = await response.json();
      setSuccess(`Matrícula realizada com sucesso! Número: ${result.numero_matricula}`);
      
      // Limpar formulário
      setFormData({
        aluno_id: '',
        curso_id: '',
        data_matricula: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setError('Ocorreu um erro ao realizar a matrícula. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Matrícula de Aluno</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center">
          <p>Carregando dados...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aluno_id">
              Aluno
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="aluno_id"
              name="aluno_id"
              value={formData.aluno_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um aluno</option>
              {alunos.map(aluno => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="curso_id">
              Curso
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="curso_id"
              name="curso_id"
              value={formData.curso_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome} ({curso.dia_semana || 'Dia não definido'} | {curso.horario_inicio || ''} - {curso.horario_fim || ''})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="data_matricula">
              Data da Matrícula
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="data_matricula"
              name="data_matricula"
              type="date"
              value={formData.data_matricula}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {submitting ? 'Processando...' : 'Realizar Matrícula'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Matricula;