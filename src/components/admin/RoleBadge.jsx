import React from 'react';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { Badge } from '../common/Badge';

export const RoleBadge = ({ role, size = 'md' }) => {
  const roleVariants = {
    [ROLES.PATIENT]: 'primary',
    [ROLES.RECEPTIONIST]: 'secondary',
    [ROLES.DOCTOR]: 'primary',
    [ROLES.ADMIN]: 'danger',
    [ROLES.CLINIC_MANAGER]: 'warning',
  };

  return (
    <Badge variant={roleVariants[role] || 'default'} size={size}>
      {ROLE_LABELS[role] || role}
    </Badge>
  );
};
