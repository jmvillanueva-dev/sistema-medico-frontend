import React, { useState, Children, isValidElement } from 'react';

interface ProfileTabsProps {
  children: React.ReactNode;
  labels: string[];
  instructions: string[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ children, labels, instructions }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b-2 border-slate-100 mb-8 overflow-x-auto">
        {labels.map((label, index) => (
          <button
            key={index}
            className={`px-6 py-4 text-base font-medium transition-colors relative whitespace-nowrap ${
              index === activeTab
                ? 'text-primary font-semibold after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="px-0 md:px-4">
        <p className="text-sm text-slate-600 mb-8 bg-slate-50 p-4 rounded-lg border-l-4 border-primary/20">
          {instructions[activeTab]}
        </p>
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
