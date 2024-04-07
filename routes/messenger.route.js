import express from 'express';
const router = express.Router();
import messengerController from '../controllers/messenger.controller.js';

router.get('/', messengerController.verifyWebhook);

router.post('/', messengerController.handleWebhook);

export default router;