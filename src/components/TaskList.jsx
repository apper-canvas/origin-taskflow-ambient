import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fetchTasks, deleteTask, updateTask } from '../services/taskService';
import TaskForm from './TaskForm';
import getIcon from '../utils/iconUtils';

// Import icons
const CheckIcon = getIcon('Check');
const ClockIcon = getIcon('Clock');
const TagIcon = getIcon('Tag');
const CalendarIcon = getIcon('Calendar');
const EditIcon = getIcon('Edit');
const Trash2Icon = getIcon('Trash2');
const CheckCircleIcon = getIcon('CheckCircle');
const CircleIcon = getIcon('Circle');
const PlusIcon = getIcon('Plus');

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const taskVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

function TaskList({ selectedFilter }) {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  useEffect(() => {
    fetchTasks({ filter: selectedFilter });
  }, [selectedFilter]);

  // Get the priority color class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'task-item-low';
      case 'medium':
        return 'task-item-medium';
      case 'high':
        return 'task-item-high';
      default:
        return 'task-item-medium';
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'to-do' : 'completed'
      };
      
      await updateTask(task.id, updatedTask);
      
      if (task.status === 'completed') {
        toast.info("Task marked as incomplete");
      } else {
        toast.success("Task completed! Great job!");
      }
    } catch (error) {
      toast.error("Error updating task status: " + error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Error deleting task: " + error.message);
    }
  };

  const openEditForm = (task) => {
    setCurrentTask(task);
    setShowEditForm(true);
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {selectedFilter === 'all' ? 'All Tasks' : 
           selectedFilter === 'today' ? 'Today\'s Tasks' :
           selectedFilter === 'upcoming' ? 'Upcoming Tasks' :
           'Completed Tasks'}
        </h2>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center gap-2 transform hover:scale-105 transition-transform duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3">Loading tasks...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-300 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => fetchTasks({ filter: selectedFilter })}
            className="mt-4 btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* No tasks message */}
      {!loading && !error && tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 bg-surface-100/50 dark:bg-surface-800/50 rounded-xl border border-dashed border-surface-300 dark:border-surface-700"
        >
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-200 dark:bg-surface-700">
            {selectedFilter === 'completed' ? (
              <CheckCircleIcon className="w-8 h-8 text-surface-600 dark:text-surface-400" />
            ) : (
              <ClockIcon className="w-8 h-8 text-surface-600 dark:text-surface-400" />
            )}
          </div>
          <h3 className="text-xl font-medium mb-2">No tasks found</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            {selectedFilter === 'all' ? "You haven't created any tasks yet." :
             selectedFilter === 'today' ? "You don't have any tasks due today." :
             selectedFilter === 'upcoming' ? "You don't have any upcoming tasks." :
             "You haven't completed any tasks yet."}
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Your First Task
          </button>
        </motion.div>
      )}
      
      {/* Tasks list */}
      <AnimatePresence>
        {!loading && !error && tasks.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {tasks.map(task => (
              <motion.div
                key={task.id}
                variants={taskVariants}
                exit="exit"
                layout
                className={`task-item ${getPriorityClass(task.priority)} ${
                  task.status === 'completed' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleCompleteTask(task)}
                    className="mt-1 flex-shrink-0 focus:outline-none"
                    aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <CircleIcon className="w-6 h-6 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${
                      task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-500' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-surface-600 dark:text-surface-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className={`flex items-center ${
                        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-surface-600 dark:text-surface-400'
                      }`}>
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                          {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && " (overdue)"}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-1 text-surface-600 dark:text-surface-400" />
                        <div className="flex flex-wrap gap-1">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="px-2 py-0.5 bg-surface-200 dark:bg-surface-700 rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-surface-500 dark:text-surface-500">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openEditForm(task)}
                      className="p-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                      aria-label="Edit task"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-surface-600 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                      aria-label="Delete task"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add/Edit Task Form */}
      <TaskForm
        showAddForm={showAddForm}
        showEditForm={showEditForm}
        currentTask={currentTask}
        setShowAddForm={setShowAddForm}
        setShowEditForm={setShowEditForm}
      />
    </div>
  );
}

export default TaskList;