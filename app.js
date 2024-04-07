import express from 'express';
import messengerRoute from './routes/messenger.route.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Enable JSON body parsing
app.use(express.json());
// Enable URL encoded body parsing
app.use(express.urlencoded({ extended: false }));

app.use('/messenger', messengerRoute);


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});