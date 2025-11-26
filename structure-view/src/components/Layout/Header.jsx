import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
// Removemos o useNavigate, pois é um popup agora

const Header = ({ title, toggleSidebar, isDarkMode, onLoginClick }) => {
  const styles = {
    container: {
      height: '64px',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      flexShrink: 0,
      transition: 'all 0.3s'
    },
    title: {
      fontSize: '1.1rem', 
      fontWeight: '600', 
      color: isDarkMode ? '#f8fafc' : '#111827'
    },
    icon: {
      cursor: 'pointer', 
      color: isDarkMode ? '#cbd5e1' : '#374151' 
    },
    loginBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'background 0.2s'
    }
  };

  return (
    <header style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div onClick={toggleSidebar}>
          <Menu size={24} style={styles.icon} />
        </div>
        {/* Pode remover o title fixo se quiser, ou deixar dinâmico */}
      </div>

      <div>
        <button 
          onClick={onLoginClick} // <--- AQUI A MUDANÇA
          style={styles.loginBtn}
        >
          <UserCircle size={18} />
          Entrar / Registrar
        </button>
      </div>
    </header>
  );
};

export default Header;