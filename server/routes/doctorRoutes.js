import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  getAllSpecialties,
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/specialties', getAllSpecialties);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

export default router;

