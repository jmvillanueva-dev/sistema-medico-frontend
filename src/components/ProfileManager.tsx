import React, { useState } from 'react';
import UpdateProfileForm from './forms/UpdateProfileForm';
import UpdateEmailForm from './forms/UpdateEmailForm';
import UpdatePasswordForm from './forms/UpdatePasswordForm';
import './ProfileManager.css';

type ActiveView = 'profile' | 'email' | 'password';

const ProfileManager: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('profile');

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <UpdateProfileForm />;
      case 'email':
        return <UpdateEmailForm />;
      case 'password':
        return <UpdatePasswordForm />;
      default:
        return <UpdateProfileForm />;
    }
  };

  const navLinks = [
    { id: 'profile', label: 'Información General' },
    { id: 'email', label: 'Correo Electrónico' },
    { id: 'password', label: 'Contraseña' },
  ];

  return (
    <div className="profile-manager">
      <nav className="profile-nav">
        {navLinks.map(link => (
          <button
            key={link.id}
            className={`nav-button ${activeView === link.id ? 'active' : ''}`}
            onClick={() => setActiveView(link.id as ActiveView)}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="profile-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileManager;
