import React, { useEffect, useState } from 'react';
import { useActiveModuleStore } from '@/store/activeModuleStore';

export const ProfileBackButton: React.FC = () => {
  const { activeModule } = useActiveModuleStore();
  const [href, setHref] = useState('/admin/dashboard');

  useEffect(() => {
    setHref(activeModule === 'medical' ? '/medical/dashboard' : '/admin/dashboard');
  }, [activeModule]);

  return (
    <a href={href} className="back-button group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:-translate-x-1"
      >
        <path d="M19 12H5M12 19l-7-7 7-7"></path>
      </svg>
      <span>Volver al Dashboard {activeModule === 'medical' ? '(Médico)' : '(Admin)'}</span>
    </a>
  );
};
