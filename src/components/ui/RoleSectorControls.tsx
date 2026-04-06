import { switchAuthRole } from '../../services/authApi';
import { sectors } from '../../data/sectors';
import { useAppStore } from '../../store/appStore';
import type { SectorId, UserRole } from '../../types';

const roles: UserRole[] = ['ansatt', 'leder', 'hr'];

export function RoleSectorControls() {
  const selectedRole = useAppStore((state) => state.selectedRole);
  const selectedSector = useAppStore((state) => state.selectedSector);
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);
  const setSelectedSector = useAppStore((state) => state.setSelectedSector);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const authConfig = useAppStore((state) => state.authConfig);

  async function handleRoleChange(role: UserRole) {
    if (authConfig?.manualRoleSwitchAllowed === false) {
      return;
    }

    const previousRole = selectedRole;
    setSelectedRole(role);

    try {
      const response = await switchAuthRole(role);
      setAuthSession(response.session);
    } catch {
      setSelectedRole(previousRole);
    }
  }

  return (
    <div className="filters-card card">
      <div>
        <label htmlFor="role-select">Rolle</label>
        <select
          id="role-select"
          value={selectedRole}
          disabled={authConfig?.manualRoleSwitchAllowed === false}
          onChange={(event) => void handleRoleChange(event.target.value as UserRole)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.toUpperCase()}
            </option>
          ))}
        </select>
        {authConfig?.manualRoleSwitchAllowed === false ? (
          <p className="muted">Rolle styres av Entra ID-claims i produksjonsmodus.</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="sector-select">Sektor</label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(event) => setSelectedSector(event.target.value as SectorId)}
        >
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
