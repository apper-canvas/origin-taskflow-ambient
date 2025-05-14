import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../store/userSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  // Handle logout
  const logout = async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      await ApperUI.logout();
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Check authentication status when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);