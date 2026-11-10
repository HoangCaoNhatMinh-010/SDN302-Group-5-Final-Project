import express from 'express';
import {
  getAllGroomers,
  getGroomerById,
  getAvailableSlots,
  getAllServices,
} from '../controllers/groomerController.js';

const router = express.Router();

router.get('/services', getAllServices);
router.get('/specialties', getAllServices);
router.get('/', getAllGroomers);
router.get('/:id', getGroomerById);
router.get('/:id/available-slots', getAvailableSlots);

export default router;
