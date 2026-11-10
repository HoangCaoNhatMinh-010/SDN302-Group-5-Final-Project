import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.js';
import {
  createAdminSetting,
  createAdminGroomer,
  createAdminSpecialty,
  createAdminUser,
  deleteAdminSetting,
  deleteAdminGroomer,
  deleteAdminSpecialty,
  getAdminAuditLogs,
  getAdminReports,
  getAdminSummary,
  getRoleSummary,
  listAdminSettings,
  listAdminGroomers,
  listAdminSpecialties,
  listAdminUsers,
  listAdminOwners,
  linkAdminUserOwner,
  updateAdminSetting,
  updateAdminGroomer,
  updateAdminSpecialty,
  updateAdminUser,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, restrictTo('ADMIN'));

router.get('/summary', getAdminSummary);
router.get('/reports', getAdminReports);
router.get('/audit-logs', getAdminAuditLogs);
router.get('/roles', getRoleSummary);

router.get('/users', listAdminUsers);
router.get('/owners', listAdminOwners);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.post('/users/:id/link-owner', linkAdminUserOwner);

router.get('/groomers', listAdminGroomers);
router.post('/groomers', createAdminGroomer);
router.put('/groomers/:id', updateAdminGroomer);
router.delete('/groomers/:id', deleteAdminGroomer);
router.get('/doctors', listAdminGroomers);
router.post('/doctors', createAdminGroomer);
router.put('/doctors/:id', updateAdminGroomer);
router.delete('/doctors/:id', deleteAdminGroomer);

router.get('/specialties', listAdminSpecialties);
router.post('/specialties', createAdminSpecialty);
router.put('/specialties/:id', updateAdminSpecialty);
router.delete('/specialties/:id', deleteAdminSpecialty);

router.get('/settings/:section', listAdminSettings);
router.post('/settings/:section', createAdminSetting);
router.put('/settings/:section/:id', updateAdminSetting);
router.delete('/settings/:section/:id', deleteAdminSetting);

export default router;
