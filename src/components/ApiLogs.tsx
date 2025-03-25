
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiLog {
  timestamp: string;
  endpoint: string;
  method: string;
  requestData: any;
  responseData: any;
}

const ApiLogs: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Load logs from localStorage
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
  
  const clearLogs = () => {
    localStorage.setItem('apiLogs', '[]');
    setLogs([]);
  };
  
  if (logs.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      style={{
        maxHeight: isExpanded ? '80vh' : '40px'
      }}
    >
      <div 
        className="bg-primary text-primary-foreground px-4 py-2 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Server size={16} />
          <span className="font-medium">API Logs ({logs.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              clearLogs();
            }}
          >
            <Trash2 size={16} />
          </Button>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 overflow-auto max-h-[calc(80vh-40px)]">
          <div className="text-xs mb-2 text-muted-foreground">
            This panel shows mock API calls that would be sent to the backend.
          </div>
          
          {logs.map((log, index) => (
            <div 
              key={index} 
              className="border rounded-md p-3 mb-2 text-sm bg-background"
            >
              <div className="flex justify-between mb-1">
                <span className="font-medium">
                  {log.method} {log.endpoint}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="mt-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">Request Data:</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(log.requestData, null, 2)}
                </pre>
              </div>
              
              <div className="mt-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">Response Data:</div>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(log.responseData, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ApiLogs;
