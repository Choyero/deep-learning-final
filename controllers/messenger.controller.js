const verifyWebhook = async (req, res) => {
    try {
        // Your verify token. Should be a random string.
        const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
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
        return res.status(200).send('WEBHOOK_VERIFIED');
    } catch (err) {
        return res.status(500).send(err.message);
    }
}


module.exports = {
    verifyWebhook,
    handleWebhook,
}