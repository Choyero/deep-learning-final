import SpamDetector from '../utils/SpamDetector.utils.js';
import { generateResponse, sendMessengerMessage } from '../utils/LLMResponder.utils.js';

const verifyWebhook = async (req, res) => {
    try {
        // Your verify token. Should be a random string.
        const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
        console.log(process.env.MESSENGER_VERIFY_TOKEN);
        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            return res.status(200).send(challenge);
            }
        }
        res.sendStatus(403);
    } catch (err) {
        return res.sendStatus(403);
    }
};

const handleWebhook = async (req, res) => {
    try {
        if (req.body.object === 'page') {
            for (let entry of req.body.entry) {
                const pageId = entry.id;
                if (pageId !== process.env.PAGE_ID) return res.sendStatus(200);
                for (let message of entry.messaging) {
                    const senderId = message.sender.id;
                    const recipientId = message.recipient.id;
                    if (!message.message) return res.sendStatus(200);
                    const messageText = message.message.text;
                    const messageId = message.message.mid;
                    if (message.message.is_echo) {
                        return res.sendStatus(200);
                    }
                    console.log(messageText);
                    if (messageText) {
                        const spamDetector = new SpamDetector(messageText);
                        //const isSpam = await spamDetector.execute(messageText);
                        const isSpam = await spamDetector.executeDistilBert(messageText);
                        // console.log(`Received message from ${senderId} with message: ${messageText}`);
                        // console.log(`Is spam: ${isSpam}`);
                        if (isSpam) {
                            await generateResponse(messageText, senderId);
                        } else {
                            await sendMessengerMessage('Not Spam: Try Sending a Spam Message', senderId);
                        }
                    }
                }
            }
        }
        return res.status(200).send('WEBHOOK_VERIFIED');
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export default {
    verifyWebhook,
    handleWebhook
};