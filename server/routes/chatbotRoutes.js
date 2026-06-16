import express from 'express';
import { handleChatMessage } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/', handleChatMessage);

export default router;
