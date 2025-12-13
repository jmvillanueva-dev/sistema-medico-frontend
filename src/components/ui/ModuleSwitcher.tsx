import React, { useEffect, useState } from 'react';
import { useActiveModuleStore, type ModuleType } from '@/store/activeModuleStore';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface Props {
  roles?: string[];
}

export const ModuleSwitcher: React.FC<Props> = ({ roles = [] }) => {
  const { activeModule, setActiveModule } = useActiveModuleStore();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingModule, setPendingModule] = useState<ModuleType | null>(null);

  // Check permissions
  // Note: Handling both naming conventions (ROLE_... and Spanish names) to be safe
  const hasAdmin = roles.includes('ADMINISTRADOR') || roles.includes('ROLE_ADMIN');
  const hasMedical = roles.some(r =>
    ['MEDICO', 'ENFERMERO', 'ROLE_MEDICAL', 'ROLE_NURSE'].includes(r)
  );

  const canSwitch = hasAdmin && hasMedical;

  // Initialize correct state based on effective role if only one exists
  useEffect(() => {
    setMounted(true);

    // SYNC LOGIC: Check URL first
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setActiveModule('admin');
    } else if (path.startsWith('/medical')) {
      setActiveModule('medical');
    } else if (!canSwitch) {
      // Fallback if not on a module path (e.g. profile) AND cannot switch
      if (hasAdmin) setActiveModule('admin');
      else if (hasMedical) setActiveModule('medical');
    }
  }, [canSwitch, hasAdmin, hasMedical, setActiveModule]);

  if (!mounted) return null;

  // If user can't switch, return null as per user request (or static badge if desired, but user focused on switcher)
  // For now I'll keep the static badge logic but it won't trigger the modal
  if (!canSwitch) {
    if (hasAdmin) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Módulo Actual</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Admin</span>
          </div>
        </div>
      );
    }
    if (hasMedical) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Módulo Actual</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Médico</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const initiateSwitch = (module: ModuleType) => {
    if (module === activeModule) return; // No change
    setPendingModule(module);
    setShowConfirm(true);
  };

  const confirmSwitch = () => {
    if (pendingModule) {
      setActiveModule(pendingModule);
      setShowConfirm(false);

      // Redirect
      window.location.href = pendingModule === 'admin' ? '/admin/dashboard' : '/medical/dashboard';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider ml-1">Módulo Actual</span>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit gap-1">
          <button
            onClick={() => initiateSwitch('admin')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ activeModule === 'admin'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Admin
          </button>
          <button
            onClick={() => initiateSwitch('medical')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ activeModule === 'medical'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Médico
          </button>
        </div>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Cambiar de Módulo"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSwitch}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="py-1 w-auto text-center">
          <p className="text-slate-600">
            ¿Estás seguro de cambiar al módulo de
            <span className="font-bold text-slate-800">
              {pendingModule === 'admin' ? ' Administrador' : ' Personal Médico'}
            </span>
            ?
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Serás redirigido al dashboard principal de este módulo.
          </p>
        </div>
      </Modal>
    </>
  );
};
