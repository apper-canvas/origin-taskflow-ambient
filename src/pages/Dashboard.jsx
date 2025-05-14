import { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { fetchTasks } from '../services/taskService';
import { setSelectedFilter } from '../store/taskSlice';
import { AuthContext } from '../App';
import TaskList from '../components/TaskList';
import getIcon from '../utils/iconUtils';

// Import icons
const CheckCircleIcon = getIcon('CheckCircleIcon');
const CalendarIcon = getIcon('Calendar');
const LayoutDashboardIcon = getIcon('LayoutDashboard');
const PlusIcon = getIcon('Plus');
const FilterIcon = getIcon('Filter');
const ChevronDownIcon = getIcon('ChevronDown');
const ListFilterIcon = getIcon('ListFilter');
const LogOutIcon = getIcon('LogOut');

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

function Dashboard() {
  const dispatch = useDispatch();
  const { user, logout, darkMode, toggleDarkMode } = useContext(AuthContext);
  const { selectedFilter } = useSelector(state => state.tasks);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Tasks Completed', value: 0, icon: 'CheckCircle', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'In Progress', value: 0, icon: 'Hourglass', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Upcoming', value: 0, icon: 'Calendar', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  ]);
  
  // Fetch tasks on component mount and when filter changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await fetchTasks({ filter: selectedFilter });
        
        // Update stats based on fetched tasks
        const completed = tasks.filter(task => task.status === 'completed').length;
        const inProgress = tasks.filter(task => task.status === 'in-progress').length;
        const upcoming = tasks.filter(task => 
          task.status !== 'completed' && 
          new Date(task.dueDate) > new Date()
        ).length;
        
        setStats([
          { label: 'Tasks Completed', value: completed, icon: 'CheckCircle', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          { label: 'In Progress', value: inProgress, icon: 'Hourglass', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { label: 'Upcoming', value: upcoming, icon: 'Calendar', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
        ]);
        
        // Show stats after a delay for better UX
        setTimeout(() => setStatsVisible(true), 300);
      } catch (error) {
        toast.error("Failed to load tasks: " + error.message);
      }
    };
    
    loadTasks();
  }, [selectedFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-surface-600 dark:text-surface-400 mt-2">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-4">
                <span className="text-surface-600 dark:text-surface-400 mr-2">
                  {user?.firstName || 'User'}
                </span>
                <button 
                  onClick={logout}
                  className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                  aria-label="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <moon className="w-5 h-5 text-surface-600" />
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <FilterIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {filterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-soft z-10 border border-surface-200 dark:border-surface-700"
                  >
                    <ul>
                      {['all', 'today', 'upcoming', 'completed'].map((filter) => (
                        <li key={filter}>
                          <button
                            onClick={() => {
                              dispatch(setSelectedFilter(filter));
                              setFilterOpen(false);
                              toast.success(`Filtered to ${filter} tasks`);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-surface-100 dark:hover:bg-surface-700 ${
                              selectedFilter === filter ? 'bg-surface-100 dark:bg-surface-700 font-medium' : ''
                            }`}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </header>
        
        {/* Stats Section */}
        {statsVisible && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card bg-white dark:bg-surface-800/50 backdrop-blur-sm border border-surface-200 dark:border-surface-700 flex items-center p-4 md:p-6"
              >
                <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                  {stat.icon === 'CheckCircle' && <CheckCircleIcon className="w-6 h-6" />}
                  {stat.icon === 'Hourglass' && <ListFilterIcon className="w-6 h-6" />}
                  {stat.icon === 'Calendar' && <CalendarIcon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-surface-600 dark:text-surface-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Dashboard Nav */}
        <div className="mb-6 border-b border-surface-200 dark:border-surface-700 pb-2">
          <nav className="flex space-x-4">
            <button className="flex items-center px-3 py-2 text-primary border-b-2 border-primary font-medium">
              <LayoutDashboardIcon className="w-5 h-5 mr-2" />
              <span>Dashboard</span>
            </button>
            <button className="flex items-center px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white">
              <CalendarIcon className="w-5 h-5 mr-2" />
              <span>Calendar</span>
            </button>
          </nav>
        </div>
        
        {/* Main Task List Component */}
        <TaskList selectedFilter={selectedFilter} />
      </div>
    </div>
  );
}

export default Dashboard;