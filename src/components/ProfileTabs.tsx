import React, { useState, Children, isValidElement } from 'react';
import './ProfileTabs.css';

interface ProfileTabsProps {
  children: React.ReactNode;
  labels: string[];
  instructions: string[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ children, labels, instructions }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="profile-tabs-container">
      <div className="tab-list">
        {labels.map((label, index) => (
          <button
            key={index}
            className={`tab-item ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <p className="tab-instruction">{instructions[activeTab]}</p>
        {Children.map(children, (child, index) => {
          const isActive = index === activeTab;
          if (isValidElement(child)) {
            return (
              <div key={index} style={{ display: isActive ? 'block' : 'none' }}>
                {child}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
