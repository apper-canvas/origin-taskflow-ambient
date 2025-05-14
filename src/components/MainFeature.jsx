import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
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
const XIcon = getIcon('X');
const PlusIcon = getIcon('Plus');
const AlertCircleIcon = getIcon('AlertCircle');

// Initial sample tasks
const initialTasks = [
  {
    id: 1,
    title: "Complete project proposal",
    description: "Finish the draft and send for review",
    dueDate: new Date(Date.now() + 86400000 * 2),
    priority: "high",
    status: "in-progress",
    tags: ["work", "important"]
  },
  {
    id: 2,
    title: "Schedule team meeting",
    description: "Prepare agenda and send invites",
    dueDate: new Date(Date.now() + 86400000),
    priority: "medium",
    status: "to-do",
    tags: ["work", "meeting"]
  },
  {
    id: 3,
    title: "Read new book chapter",
    description: "Chapter 5 of 'Design Patterns'",
    dueDate: new Date(Date.now() + 86400000 * 5),
    priority: "low",
    status: "to-do",
    tags: ["personal", "learning"]
  },
  {
    id: 4,
    title: "Grocery shopping",
    description: "Buy ingredients for dinner",
    dueDate: new Date(Date.now() - 86400000),
    priority: "medium",
    status: "completed",
    tags: ["personal", "shopping"]
  }
];

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

function MainFeature({ selectedFilter }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
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

  // Apply filtering based on the selected filter
  useEffect(() => {
    let filtered = [...tasks];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (selectedFilter) {
      case 'today':
        filtered = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() && task.status !== 'completed';
        });
        break;
      case 'upcoming':
        filtered = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() > today.getTime() && task.status !== 'completed';
        });
        break;
      case 'completed':
        filtered = tasks.filter(task => task.status === 'completed');
        break;
      default:
        // 'all' filter - no additional filtering needed
        break;
    }
    
    setFilteredTasks(filtered);
  }, [tasks, selectedFilter]);

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

  const handleAddTask = () => {
    if (validateTask(newTask)) {
      const taskToAdd = {
        ...newTask,
        id: Date.now(),
        dueDate: new Date(newTask.dueDate)
      };
      
      setTasks(prev => [...prev, taskToAdd]);
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
    }
  };

  const handleEditTask = () => {
    if (validateTask(currentTask)) {
      setTasks(prev => 
        prev.map(task => 
          task.id === currentTask.id 
            ? { 
                ...currentTask, 
                dueDate: new Date(currentTask.dueDate) 
              } 
            : task
        )
      );
      setShowEditForm(false);
      toast.success("Task updated successfully!");
      setErrors({});
    }
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success("Task deleted successfully!");
  };

  const handleCompleteTask = (id) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, status: task.status === 'completed' ? 'to-do' : 'completed' } 
          : task
      )
    );
    
    const task = tasks.find(task => task.id === id);
    if (task.status === 'completed') {
      toast.info("Task marked as incomplete");
    } else {
      toast.success("Task completed! Great job!");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !newTask.tags.includes(newTag.trim())) {
      if (showAddForm) {
        setNewTask(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
      } else if (showEditForm) {
        setCurrentTask(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag, isEditMode) => {
    if (isEditMode) {
      setCurrentTask(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    }
  };

  const openEditForm = (task) => {
    setCurrentTask({
      ...task,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd')
    });
    setShowEditForm(true);
  };

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
      
      {/* No tasks message */}
      {filteredTasks.length === 0 && (
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
        {filteredTasks.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredTasks.map(task => (
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
                    onClick={() => handleCompleteTask(task.id)}
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
                        new Date(task.dueDate) < new Date() && task.status !== 'completed'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-surface-600 dark:text-surface-400'
                      }`}>
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          {new Date(task.dueDate) < new Date() && task.status !== 'completed' && " (overdue)"}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-1 text-surface-600 dark:text-surface-400" />
                        <div className="flex flex-wrap gap-1">
                          {task.tags.length > 0 ? (
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
                            onClick={() => handleRemoveTag(tag, false)}
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
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="btn btn-primary"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Task Form */}
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="edit-title">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    className={`form-input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    value={currentTask.title}
                    onChange={e => setCurrentTask({...currentTask, title: e.target.value})}
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
                    value={currentTask.description}
                    onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
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
                      value={currentTask.dueDate}
                      onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}
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
                      value={currentTask.priority}
                      onChange={e => setCurrentTask({...currentTask, priority: e.target.value})}
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
                    value={currentTask.status}
                    onChange={e => setCurrentTask({...currentTask, status: e.target.value})}
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
                  
                  {currentTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentTask.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 dark:bg-surface-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag, true)}
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
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditTask}
                    className="btn btn-primary"
                  >
                    Update Task
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;