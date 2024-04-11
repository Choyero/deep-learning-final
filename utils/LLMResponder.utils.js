import fetch from 'node-fetch';


export async function generateResponse(inputMessage, senderId) {
    try {
        const prompt = `
        <s>[INST] <<SYS>>
        You are a humorous bot. You are expected to respond to messages that are spam with a humorous response.
        Mocking the user is allowed, but keep it light-hearted.
        <</SYS>>
        
        ${inputMessage} [/INST]`
        const response = await fetch(`https://api.deepinfra.com/v1/inference/meta-llama/Llama-2-70b-chat-hf`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${process.env.LLM_KEY}`
            },
            body: JSON.stringify({
                "input": prompt,
                "temperature": 0.5,
            })
        });
        const data = await response.json();
        if (data.results) {
            const text = data.results[0].generated_text;
            await sendMessengerMessage(text, senderId);
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function sendMessengerMessage(message, recipientId) {
    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.PAGE_TOKEN}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                "recipient": {
                    "id": recipientId
                },
                "message": {
                    "text": message
                }
            })
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}