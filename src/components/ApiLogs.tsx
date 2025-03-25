import { useState, useEffect } from 'react';

interface ApiLog {
  timestamp: string;
  endpoint: string;
  method: string;
  requestData: any;
  responseData: any;
}

const ApiLogs: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  
  useEffect(() => {
    // Load logs from localStorage (keeping this for future use)
    const loadLogs = () => {
      try {
        const storedLogs = localStorage.getItem('apiLogs');
        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        }
      } catch (error) {
        console.error('Error loading API logs:', error);
      }
    };
    
    loadLogs();
    
    // Set up event listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'apiLogs') {
        loadLogs();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically
    const interval = setInterval(loadLogs, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Return null to hide the component completely
  return null;
};

export default ApiLogs;
