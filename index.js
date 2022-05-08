const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, MongoCursorExhaustedError } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xsh1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        await client.connect();
        const groceryCollection = client.db('warehouseUser').collection('grocery');
        const query = {};
        const cursor = groceryCollection.find(query);
        const groceries = await cursor.toArray();
    }

    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running warehouse server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})