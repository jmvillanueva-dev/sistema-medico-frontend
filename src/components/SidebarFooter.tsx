import React from 'react';
import { useAuthStore } from '@/store/authStore';

// Icons placeholders - assuming we have the paths, or passing them as props would be cleaner but direct import works for now
import LogoutIcon from "@/icons/logout.svg";
import ChangeModuleIcon from "@/icons/switch.svg";
import ProfileIcon from "@/icons/system/profile.svg";

interface Props {
  roles?: string[];
}

export const SidebarFooter: React.FC<Props> = ({ roles = [] }) => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  const hasAdmin = roles.includes('ADMINISTRADOR') || roles.includes('ROLE_ADMIN');
  const hasMedical = roles.some(r =>
    ['MEDICO', 'ENFERMERO', 'ROLE_MEDICAL', 'ROLE_NURSE'].includes(r)
  );

  const canSwitch = hasAdmin && hasMedical;

  return (
    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-1">
      <a
        href="/profile"
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 font-medium text-sm transition-all hover:bg-slate-50 hover:text-primary no-underline group/footer relative"
      >
        <img src={ProfileIcon.src} alt="" className="w-5 h-5 shrink-0 transition-opacity group-hover/footer:opacity-80" />
        <span className="whitespace-nowrap overflow-hidden text-ellipsis lg:group-[.collapsed]:hidden">
          Mi Perfil
        </span>
        {/* Tooltip for collapsed state */}
        <div className="fixed left-[70px] px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible transition-all duration-200 lg:group-[.collapsed]:group-hover/footer:opacity-100 lg:group-[.collapsed]:group-hover/footer:visible z-[1300] pointer-events-none whitespace-nowrap">
          Mi Perfil
        </div>
      </a>

      {canSwitch && (
        <a
          href="/select-module"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 font-medium text-sm transition-all hover:bg-slate-50 hover:text-blue-600 no-underline group/footer relative"
        >
          <img src={ChangeModuleIcon.src} alt="" className="w-5 h-5 shrink-0 transition-opacity group-hover/footer:opacity-80" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis lg:group-[.collapsed]:hidden">
            Cambiar Módulo
          </span>
          {/* Tooltip for collapsed state */}
          <div className="fixed left-[70px] px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible transition-all duration-200 lg:group-[.collapsed]:group-hover/footer:opacity-100 lg:group-[.collapsed]:group-hover/footer:visible z-[1300] pointer-events-none whitespace-nowrap">
            Cambiar Módulo
          </div>
        </a>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 font-medium text-sm transition-all hover:bg-red-50 hover:text-red-600 cursor-pointer border-none bg-transparent w-full text-left group/footer relative"
      >
        <img src={LogoutIcon.src} alt="" className="w-5 h-5 shrink-0 transition-opacity group-hover/footer:opacity-80" />
        <span className="whitespace-nowrap overflow-hidden text-ellipsis lg:group-[.collapsed]:hidden">
          Cerrar sesión
        </span>
        {/* Tooltip for collapsed state */}
        <div className="fixed left-[70px] px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible transition-all duration-200 lg:group-[.collapsed]:group-hover/footer:opacity-100 lg:group-[.collapsed]:group-hover/footer:visible z-[1300] pointer-events-none whitespace-nowrap">
          Cerrar sesión
        </div>
      </button>
    </div>
  );
};
