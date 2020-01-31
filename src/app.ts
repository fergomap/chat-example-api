import express, {Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const clients: Response[] = [];
const messages: string[] = [];
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const messagesRealTimeEndpoint = (request: Request, response: Response): void => {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    clients.push(response);

    response.write(`data: ${JSON.stringify(messages)}\n\n`);
    response.on('close', () => clients.splice(clients.indexOf(response), 1));
};

const sendMessage = (request: Request, response: Response): void => {
    messages.push(request.body.message);
    clients.forEach(client => client.write(`data: ${JSON.stringify(messages)}\n\n`));
    response.send();
};

const getConnectedClients = (request: Request, response: Response): void => {
    response.json({clients: clients.length});
};


app.get('/clients', getConnectedClients);
app.post('/send-message', sendMessage);
app.get('/messages', messagesRealTimeEndpoint);

app.listen(8080);
