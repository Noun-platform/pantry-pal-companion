
// Mock API service to simulate backend calls
// This will be replaced with real API calls when backend is ready

// Define response types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock errors randomly (10% chance)
const shouldError = () => Math.random() < 0.1;

// Generic mock API call function
async function mockApiCall<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  data?: any
): Promise<ApiResponse<T>> {
  console.log(`[MOCK API] ${method} ${endpoint}`, data);
  
  // Simulate network delay (300-800ms)
  await delay(300 + Math.random() * 500);
  
  // Simulate random errors
  if (shouldError()) {
    console.log(`[MOCK API] Error in ${method} ${endpoint}`);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
  
  // Store the request in localStorage for debugging/demo purposes
  const apiLogs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
  apiLogs.push({
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    requestData: data,
    // This would be the actual response in a real API
    // For now, we're just echoing back the request data
    responseData: data
  });
  localStorage.setItem('apiLogs', JSON.stringify(apiLogs));
  
  // Return success with the data
  // In a real API, this would be the response from the server
  // For now, we're just echoing back the request data
  return {
    success: true,
    data: data as T
  };
}

// User API
export const userApi = {
  signUp: async (username: string, email: string, password: string) => {
    return mockApiCall<{ id: string; username: string; email: string }>(
      '/api/users', 
      'POST', 
      { username, email, password }
    );
  },
  
  signIn: async (email: string, password: string) => {
    return mockApiCall<{ token: string; user: { id: string; username: string; email: string } }>(
      '/api/auth/login', 
      'POST', 
      { email, password }
    );
  },
  
  logout: async () => {
    return mockApiCall<void>('/api/auth/logout', 'POST');
  },
  
  getProfile: async (userId: string) => {
    return mockApiCall<{ id: string; username: string; email: string }>(
      `/api/users/${userId}`, 
      'GET'
    );
  }
};

// Grocery API
export const groceryApi = {
  getItems: async (userId: string) => {
    return mockApiCall<any[]>(
      `/api/users/${userId}/items`, 
      'GET'
    );
  },
  
  addItem: async (userId: string, item: any) => {
    return mockApiCall<any>(
      `/api/users/${userId}/items`, 
      'POST', 
      item
    );
  },
  
  updateItem: async (userId: string, itemId: string, updates: any) => {
    return mockApiCall<any>(
      `/api/users/${userId}/items/${itemId}`, 
      'PUT', 
      updates
    );
  },
  
  deleteItem: async (userId: string, itemId: string) => {
    return mockApiCall<void>(
      `/api/users/${userId}/items/${itemId}`, 
      'DELETE'
    );
  }
};

// Friends API
export const friendsApi = {
  getFriends: async (userId: string) => {
    return mockApiCall<any[]>(
      `/api/users/${userId}/friends`, 
      'GET'
    );
  },
  
  addFriend: async (userId: string, friendData: any) => {
    return mockApiCall<any>(
      `/api/users/${userId}/friends`, 
      'POST', 
      friendData
    );
  },
  
  removeFriend: async (userId: string, friendId: string) => {
    return mockApiCall<void>(
      `/api/users/${userId}/friends/${friendId}`, 
      'DELETE'
    );
  }
};
