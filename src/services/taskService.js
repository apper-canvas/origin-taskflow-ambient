import { store } from '../store/store';
import { setTasks, setLoading, setError, setSelectedTask } from '../store/taskSlice';

// Helper function to format database tasks to our application structure
const formatDbTaskToAppTask = (dbTask) => {
  if (!dbTask) return null;
  
  return {
    id: dbTask.Id,
    title: dbTask.title || '',
    description: dbTask.description || '',
    dueDate: dbTask.dueDate ? new Date(dbTask.dueDate) : null,
    priority: dbTask.priority || 'medium',
    status: dbTask.status || 'to-do',
    tags: dbTask.Tags ? dbTask.Tags.split(',') : []
  };
};

// Helper function to format application tasks to database structure
const formatAppTaskToDbTask = (appTask) => {
  if (!appTask) return null;
  
  return {
    title: appTask.title,
    description: appTask.description,
    dueDate: appTask.dueDate,
    priority: appTask.priority,
    status: appTask.status,
    Tags: appTask.tags ? appTask.tags.join(',') : ''
  };
};

// Get ApperClient instance
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Fetch tasks with optional filters
export const fetchTasks = async (filters = {}) => {
  store.dispatch(setLoading(true));
  
  try {
    const apperClient = getApperClient();
    
    // Prepare query parameters
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Tags" } },
        { Field: { Name: "title" } },
        { Field: { Name: "description" } },
        { Field: { Name: "dueDate" } },
        { Field: { Name: "priority" } },
        { Field: { Name: "status" } }
      ],
      orderBy: [
        { field: "dueDate", direction: "asc" }
      ],
      where: []
    };
    
    // Apply filters based on selected filter type
    if (filters.filter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filters.filter) {
        case 'today':
          params.where.push({
            fieldName: "dueDate",
            Operator: "ExactMatch",
            values: [today.toISOString().split('T')[0]]
          });
          params.where.push({
            fieldName: "status",
            Operator: "NotEquals",
            values: ["completed"]
          });
          break;
        case 'upcoming':
          params.where.push({
            fieldName: "dueDate",
            Operator: "GreaterThan",
            values: [today.toISOString().split('T')[0]]
          });
          params.where.push({
            fieldName: "status",
            Operator: "NotEquals",
            values: ["completed"]
          });
          break;
        case 'completed':
          params.where.push({
            fieldName: "status",
            Operator: "ExactMatch",
            values: ["completed"]
          });
          break;
      }
    }
    
    // Execute the query
    const response = await apperClient.fetchRecords('task', params);
    
    if (response && response.data) {
      // Format the tasks for our application
      const formattedTasks = response.data.map(task => formatDbTaskToAppTask(task));
      store.dispatch(setTasks(formattedTasks));
      return formattedTasks;
    } else {
      store.dispatch(setTasks([]));
      return [];
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    store.dispatch(setError(error.message || "Failed to fetch tasks"));
    return [];
  }
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  store.dispatch(setLoading(true));
  
  try {
    const apperClient = getApperClient();
    
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Tags" } },
        { Field: { Name: "title" } },
        { Field: { Name: "description" } },
        { Field: { Name: "dueDate" } },
        { Field: { Name: "priority" } },
        { Field: { Name: "status" } }
      ]
    };
    
    const response = await apperClient.getRecordById('task', taskId, params);
    
    if (response && response.data) {
      const formattedTask = formatDbTaskToAppTask(response.data);
      store.dispatch(setSelectedTask(formattedTask));
      store.dispatch(setLoading(false));
      return formattedTask;
    } else {
      store.dispatch(setSelectedTask(null));
      store.dispatch(setLoading(false));
      return null;
    }
  } catch (error) {
    console.error(`Error fetching task with ID ${taskId}:`, error);
    store.dispatch(setError(error.message || `Failed to fetch task with ID ${taskId}`));
    return null;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  store.dispatch(setLoading(true));
  
  try {
    const apperClient = getApperClient();
    const formattedTask = formatAppTaskToDbTask(taskData);
    
    const response = await apperClient.createRecord('task', {
      records: [formattedTask]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      // Refresh the task list after creating a new task
      await fetchTasks();
      return response.results[0].data;
    } else {
      throw new Error(response?.message || "Failed to create task");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    store.dispatch(setError(error.message || "Failed to create task"));
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  store.dispatch(setLoading(true));
  
  try {
    const apperClient = getApperClient();
    const formattedTask = formatAppTaskToDbTask(taskData);
    
    const response = await apperClient.updateRecord('task', {
      records: [{
        Id: taskId,
        ...formattedTask
      }]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      // Refresh the task list after updating
      await fetchTasks();
      return response.results[0].data;
    } else {
      throw new Error(response?.message || "Failed to update task");
    }
  } catch (error) {
    console.error(`Error updating task with ID ${taskId}:`, error);
    store.dispatch(setError(error.message || `Failed to update task with ID ${taskId}`));
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  store.dispatch(setLoading(true));
  
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.deleteRecord('task', {
      RecordIds: [taskId]
    });
    
    if (response && response.success) {
      // Refresh the task list after deletion
      await fetchTasks();
      return true;
    } else {
      throw new Error(response?.message || "Failed to delete task");
    }
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}:`, error);
    store.dispatch(setError(error.message || `Failed to delete task with ID ${taskId}`));
    throw error;
  }
};