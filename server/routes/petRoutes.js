import express from 'express';
import {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} from '../controllers/petController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, restrictTo('PET_OWNER'));

router.route('/')
  .get(getPets)
  .post(createPet);

router.route('/:id')
  .get(getPetById)
  .put(updatePet)
  .delete(deletePet);

export default router;
