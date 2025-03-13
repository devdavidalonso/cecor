import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title, 
    Tooltip, 
    Legend,
    ArcElement,
    Filler
  } from 'chart.js';
  import { Line, Pie, Bar } from 'react-chartjs-2';
  
  // Registrar componentes do Chart.js
  ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title, 
    Tooltip, 
    Legend,
    ArcElement,
    Filler
  );
  
  const EnrollmentChart = ({ 
    type = 'line', 
    data,
    title,
    height = 300,
  }) => {
    // Opções padrão para gráficos
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
    };
  
    // Configurações específicas por tipo de gráfico
    const getSpecificOptions = () => {
      switch(type) {
        case 'line':
          return {
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
            },
          };
        case 'pie':
          return {
            cutout: '0%',
          };
        case 'bar':
          return {
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          };
        default:
          return {};
      }
    };
  
    // Mesclar opções base com específicas
    const options = {
      ...baseOptions,
      ...getSpecificOptions(),
    };
  
    // Renderizar o tipo apropriado de gráfico
    const renderChart = () => {
      const chartProps = {
        data,
        options,
        height,
      };
  
      switch(type) {
        case 'line':
          return <Line {...chartProps} />;
        case 'pie':
          return <Pie {...chartProps} />;
        case 'bar':
          return <Bar {...chartProps} />;
        default:
          return <Line {...chartProps} />;
      }
    };
  
    return (
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    );
  };
  
  export default EnrollmentChart;