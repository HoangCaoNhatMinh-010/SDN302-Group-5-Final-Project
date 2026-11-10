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
    isPetOwner: role === ROLES.PET_OWNER,
    isReceptionist: role === ROLES.RECEPTIONIST,
    isVetDoctor: role === ROLES.VET_DOCTOR,
    isGroomer: role === ROLES.GROOMER,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.MANAGER,
    hasRole: (targetRole) => role === targetRole,
    hasAnyRole: (roleList = []) => roleList.includes(role),
  };
};
