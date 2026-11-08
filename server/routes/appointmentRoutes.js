import express from 'express';
import {
  getMyAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my-appointments', getMyAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;

