import express from 'express';
import {
  getMyAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, restrictTo('PET_OWNER'));

router.get('/my-appointments', getMyAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;
