import React from 'react';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { Badge } from '../common/Badge';

export const RoleBadge = ({ role, size = 'md' }) => {
  const roleVariants = {
    [ROLES.PET_OWNER]: 'primary',
    [ROLES.RECEPTIONIST]: 'secondary',
    [ROLES.GROOMER]: 'primary',
    [ROLES.VET_DOCTOR]: 'success',
    [ROLES.ADMIN]: 'danger',
    [ROLES.MANAGER]: 'warning',
  };

  return (
    <Badge variant={roleVariants[role] || 'default'} size={size}>
      {ROLE_LABELS[role] || role}
    </Badge>
  );
};
