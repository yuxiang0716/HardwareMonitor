import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
// import PowerLogPage from './pages/PowerLogPage'; // 待辦
// import AlertsPage from './pages/AlertsPage';       // 待辦

// 假設這裡有一個簡單的權限檢查邏輯 (實際應從 Context 或 Redux 取得)
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); 
};

// 用於保護需要登入的路由
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登入頁面 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 首頁 (需登入保護) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* 待辦路由
        <Route path="/power-logs" element={<ProtectedRoute><PowerLogPage /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/account-management" element={<ProtectedRoute><AccountManagementPage /></ProtectedRoute>} />
        */}
        
        {/* 匹配不到路由時重定向到首頁或顯示 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;