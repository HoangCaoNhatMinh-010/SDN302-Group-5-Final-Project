import express from 'express';
import {
  getChatContacts,
  getMessages,
  sendMessage,
  askAiConsultant,
} from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/contacts', getChatContacts);
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/ai-consult', askAiConsultant);

export default router;

