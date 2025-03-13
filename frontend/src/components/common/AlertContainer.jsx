// src/components/common/AlertContainer.jsx
import { useAlert } from '../../contexts/AlertContext';

export default function AlertContainer() {
  const { alerts, removeAlert } = useAlert();
  
  if (!alerts || alerts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-72">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`p-4 rounded shadow-lg border-l-4 ${
            alert.type === 'error' ? 'bg-red-50 border-red-500 text-red-700' : 
            alert.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 
            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
            'bg-blue-50 border-blue-500 text-blue-700'
          } flex justify-between items-start`}
        >
          <div className="flex-1">{alert.message}</div>
          <button 
            onClick={() => removeAlert(alert.id)}
            className="ml-2 text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}