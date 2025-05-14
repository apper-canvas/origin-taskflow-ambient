import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const AlertTriangleIcon = getIcon('AlertTriangle');
const ArrowLeftIcon = getIcon('ArrowLeft');

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl font-medium mb-2">Page Not Found</p>
        <p className="text-surface-600 dark:text-surface-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        
        <Link to="/" className="inline-flex items-center btn btn-primary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go Back Home
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;