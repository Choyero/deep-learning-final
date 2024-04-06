const express = require('express');
const messengerRoute = require('./routes/messenger.route');

const app = express();
const port = 3000;

app.use('/messenger', messengerRoute);


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});