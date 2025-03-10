import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ListaPresenca = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [diasMarco, setDiasMarco] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Função para gerar dias do mês de março
    const gerarDiasMarco = () => {
      const ano = new Date().getFullYear();
      const dias = [];
      const ultimoDia = new Date(ano, 2, 31).getDate();
      
      for (let i = 1; i <= ultimoDia; i++) {
        const data = new Date(ano, 2, i);
        dias.push({
          dia: i,
          data: `${ano}-03-${String(i).padStart(2, '0')}`,
          diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' })
        });
      }
      
      return dias;
    };
    
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const diasMes = gerarDiasMarco();
        setDiasMarco(diasMes);
        
        // Buscar dados do curso
        const cursoRes = await fetch(`http://localhost:8080/api/cursos/${id}`);
        if (!cursoRes.ok) {
          throw new Error('Erro ao buscar informações do curso');
        }
        const cursoData = await cursoRes.json();
        setCurso(cursoData);
        
        // Buscar matrículas do curso
        const matriculasRes = await fetch(`http://localhost:8080/api/matriculas/curso/${id}`);
        if (!matriculasRes.ok) {
          throw new Error('Erro ao buscar matrículas');
        }
        const matriculasData = await matriculasRes.json();
        setMatriculas(matriculasData);
        
        // Inicializar presenças
        const presencasObj = {};
        matriculasData.forEach(matricula => {
          presencasObj[matricula.id] = {};
          diasMes.forEach(dia => {
            presencasObj[matricula.id][dia.data] = false;
          });
        });
        setPresencas(presencasObj);
        
        // Buscar presenças já registradas
        const presencasRes = await fetch(`http://localhost:8080/api/presencas/curso/${id}/mes/2025-03`);
        if (presencasRes.ok) {
          const presencasData = await presencasRes.json();
          // Atualizar estado com presenças existentes
          // Este código dependerá do formato exato da resposta da API
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error.message || 'Ocorreu um erro ao carregar os dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const togglePresenca = (matriculaId, data) => {
    setPresencas(prev => ({
      ...prev,
      [matriculaId]: {
        ...prev[matriculaId],
        [data]: !prev[matriculaId][data]
      }
    }));
  };

  const salvarPresenca = async (matriculaId, data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const presente = presencas[matriculaId][data];
      
      const response = await fetch('http://localhost:8080/api/presencas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula_id: matriculaId,
          data_aula: data,
          presente: presente
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar presença');
      }
      
      setSuccess('Presença salva com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar presença:', error);
      setError('Ocorreu um erro ao salvar a presença');
    } finally {
      setSaving(false);
    }
  };

  const exportarExcel = () => {
    if (!curso || matriculas.length === 0) return;
    
    // Preparar dados para a planilha
    const dados = [
      // Cabeçalho
      ['LISTA DE PRESENÇA - MARÇO/2025', '', '', ''],
      [`Curso: ${curso.nome}`, '', '', ''],
      [`Dias/Horário: ${curso.dia_semana || 'Não definido'} - ${curso.horario_inicio || ''} às ${curso.horario_fim || ''}`, '', '', ''],
      ['', '', '', ''],
      // Cabeçalho da tabela
      ['Aluno', ...diasMarco.map(d => d.dia)]
    ];
    
    // Adicionar dados dos alunos
    matriculas.forEach(matricula => {
      const linha = [
        matricula.aluno_nome,
        ...diasMarco.map(d => presencas[matricula.id]?.[d.data] ? 'P' : '')
      ];
      dados.push(linha);
    });
    
    // Criar planilha
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Presença');
    
    // Ajustar largura das colunas
    const wscols = [{ wch: 30 }]; // Primeira coluna mais larga para nomes
    for (let i = 0; i < diasMarco.length; i++) {
      wscols.push({ wch: 5 }); // Colunas de dias mais estreitas
    }
    ws['!cols'] = wscols;
    
    // Gerar arquivo
    XLSX.writeFile(wb, `Lista_Presenca_${curso.nome}_Marco_2025.xlsx`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de Presença - Março/2025</h1>
          {curso && (
            <p className="text-gray-600">
              {curso.nome} | {curso.dia_semana || 'Dia não definido'} | {curso.horario_inicio || ''} - {curso.horario_fim || ''}
            </p>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Voltar
          </button>
          <button
            onClick={exportarExcel}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            disabled={matriculas.length === 0}
          >
            Exportar Excel
          </button>
        </div>
      </div>
      
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
      
      {matriculas.length === 0 ? (
        <div className="bg-white shadow-md rounded px-8 py-6 mb-4 text-center">
          <p>Não há alunos matriculados neste curso.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="sticky left-0 bg-gray-100 px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                {diasMarco.map(dia => (
                  <th key={dia.data} className="px-3 py-3 border-b border-gray-200 text-center text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    <div>{dia.dia}</div>
                    <div className="text-xxs">{dia.diaSemana}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriculas.map(matricula => (
                <tr key={matricula.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-6 py-4 border-b border-gray-200 text-sm leading-5 font-medium text-gray-900">
                    {matricula.aluno_nome}
                  </td>
                  {diasMarco.map(dia => (
                    <td key={`${matricula.id}-${dia.data}`} className="px-2 py-4 border-b border-gray-200 text-sm leading-5 text-center">
                      <div className="flex flex-col items-center">
                        <input
                          type="checkbox"
                          checked={presencas[matricula.id]?.[dia.data] || false}
                          onChange={() => togglePresenca(matricula.id, dia.data)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <button
                          onClick={() => salvarPresenca(matricula.id, dia.data)}
                          className="mt-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                          disabled={saving}
                        >
                          Salvar
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaPresenca;