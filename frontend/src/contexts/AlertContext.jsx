import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', autoClose = true, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = { id, message, type, autoClose, duration };
    
    setAlerts((prev) => [...prev, newAlert]);
    
    if (autoClose) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id));
  };

  const alertContextValue = {
    alerts,
    showAlert,
    removeAlert,
    success: (message, autoClose = true, duration = 5000) => 
      showAlert(message, 'success', autoClose, duration),
    error: (message, autoClose = true, duration = 5000) => 
      showAlert(message, 'error', autoClose, duration),
    warning: (message, autoClose = true, duration = 5000) => 
      showAlert(message, 'warning', autoClose, duration),
    info: (message, autoClose = true, duration = 5000) => 
      showAlert(message, 'info', autoClose, duration),
  };

  return (
    <AlertContext.Provider value={alertContextValue}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

export default AlertContext;