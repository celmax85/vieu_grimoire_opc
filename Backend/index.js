require("dotenv").config();
const { app } = require('./Config/app');
const { Usersrouter } = require('./Controllers/Users');
const { Booksrouter } = require('./Controllers/Books');

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api/auth', Usersrouter);
app.use('/api/books', Booksrouter);

app.listen(PORT, () => console.log(`Server on ${PORT}`));