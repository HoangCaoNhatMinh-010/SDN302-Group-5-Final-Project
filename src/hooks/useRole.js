import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

/**
 * Custom hook to easily check role capabilities
 */
export const useRole = () => {
  const { role, currentUser } = useAuth();

  return {
    role,
    currentUser,
    isPatient: role === ROLES.PATIENT,
    isReceptionist: role === ROLES.RECEPTIONIST,
    isDoctor: role === ROLES.DOCTOR,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.CLINIC_MANAGER,
    hasRole: (targetRole) => role === targetRole,
    hasAnyRole: (roleList = []) => roleList.includes(role),
  };
};
