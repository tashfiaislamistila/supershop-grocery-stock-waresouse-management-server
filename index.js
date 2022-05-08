const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { ObjectID } = require('bson');
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
        const groceryCollection = client.db('superShopGrocery').collection('grocery');

        app.get('/grocery', async (req, res) => {
            const query = {};
            const cursor = groceryCollection.find(query);
            const groceries = await cursor.toArray();
            res.send(groceries);
        });

        app.get('/grocery/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const grocery = await groceryCollection.findOne(query);
            res.send(grocery);
        });

        //POST
        app.post('/grocery', async (req, res) => {
            const newInventory = req.body;
            const result = await groceryCollection.insertOne(newInventory);
            res.send(result);
        });
        //PUT
        app.put('/grocery/:id', async (req, res) => {
            const id = req.params.id;
            const updateInventory = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedGrocery = {
                $set: updateInventory
            };
            const result = await groceryCollection.updateOne(filter, updatedGrocery, options);
            res.send(result);
        });
        //DELETE 
        app.delete('/grocery/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await groceryCollection.deleteOne(query);
            res.send(result);
        });

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