import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // Tất cả các route bên dưới cần login

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/change-password', changePassword);

export default router;

