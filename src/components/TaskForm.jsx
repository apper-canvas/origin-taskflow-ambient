import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { createTask, updateTask } from '../services/taskService';
import getIcon from '../utils/iconUtils';

// Import icons
const XIcon = getIcon('X');
const PlusIcon = getIcon('Plus');
const AlertCircleIcon = getIcon('AlertCircle');

// Animation variants for the form
const formVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0,
    y: 50,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

function TaskForm({ showAddForm, showEditForm, currentTask, setShowAddForm, setShowEditForm }) {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
    priority: "medium",
    status: "to-do",
    tags: []
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when closing
  useEffect(() => {
    if (!showAddForm) {
      setNewTask({
        title: "",
        description: "",
        dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
        priority: "medium",
        status: "to-do",
        tags: []
      });
      setErrors({});
    }
  }, [showAddForm]);
  
  // Set form data when editing a task
  useEffect(() => {
    if (currentTask && showEditForm) {
      setNewTask({
        ...currentTask,
        dueDate: format(new Date(currentTask.dueDate), 'yyyy-MM-dd')
      });
      setErrors({});
    }
  }, [currentTask, showEditForm]);

  const validateTask = (task) => {
    const newErrors = {};
    
    if (!task.title.trim()) {
      newErrors.title = "Title is required";
    } else if (task.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }
    
    if (task.description && task.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    
    if (!task.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    if (validateTask(newTask)) {
      setIsSubmitting(true);
      try {
        const taskToAdd = {
          ...newTask,
          dueDate: new Date(newTask.dueDate)
        };
        
        await createTask(taskToAdd);
        setShowAddForm(false);
        toast.success("Task added successfully!");
        
        // Reset form
        setNewTask({
          title: "",
          description: "",
          dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
          priority: "medium",
          status: "to-do",
          tags: []
        });
        setErrors({});
      } catch (error) {
        toast.error("Error adding task: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditTask = async () => {
    if (validateTask(newTask)) {
      setIsSubmitting(true);
      try {
        const taskToUpdate = {
          ...newTask,
          dueDate: new Date(newTask.dueDate)
        };
        
        await updateTask(newTask.id, taskToUpdate);
        setShowEditForm(false);
        toast.success("Task updated successfully!");
        setErrors({});
      } catch (error) {
        toast.error("Error updating task: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !newTask.tags.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <>
      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Task</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="title">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className={`form-input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircleIcon className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    className={`form-input resize-none ${errors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircleIcon className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                      Due Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      className={`form-input ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={newTask.dueDate}
                      onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircleIcon className="w-4 h-4 mr-1" />
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="priority">
                      Priority
                    </label>
                    <select
                      id="priority"
                      className="form-input"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input rounded-r-none"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 bg-primary text-white rounded-r-lg hover:bg-primary-dark"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                  
                  {newTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newTask.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 dark:bg-surface-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white focus:outline-none"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner w-5 h-5 mr-2"></span>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>Add Task</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Task Form - Uses the same structure but with different handlers */}
      <AnimatePresence>
        {showEditForm && currentTask && (
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowEditForm(false)}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Task</h3>
                <button 
                  onClick={() => setShowEditForm(false)}
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Form fields same as Add Task form but with edit handlers */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="edit-title">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    className={`form-input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircleIcon className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="edit-description">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    rows="3"
                    className={`form-input resize-none ${errors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircleIcon className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="edit-dueDate">
                      Due Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      id="edit-dueDate"
                      className={`form-input ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={newTask.dueDate}
                      onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircleIcon className="w-4 h-4 mr-1" />
                        {errors.dueDate}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="edit-priority">
                      Priority
                    </label>
                    <select
                      id="edit-priority"
                      className="form-input"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="edit-status">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    className="form-input"
                    value={newTask.status}
                    onChange={e => setNewTask({...newTask, status: e.target.value})}
                  >
                    <option value="to-do">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input rounded-r-none"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 bg-primary text-white rounded-r-lg hover:bg-primary-dark"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                  
                  {newTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newTask.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 dark:bg-surface-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white focus:outline-none"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="btn btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditTask}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner w-5 h-5 mr-2"></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>Update Task</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default TaskForm;