const express = require('express');
const router = express.Router();
const messengerController = require('../controllers/messenger.controller');

router.get('/', messengerController.verifyWebhook);

router.post('/', messengerController.handleWebhook);

module.exports = router;