const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');


dotenv.config();

const port = process.env.PAYMENT_PORT || 3006;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Payment Server is running on port ${port}`);
});