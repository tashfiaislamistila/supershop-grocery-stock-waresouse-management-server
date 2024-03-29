const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { ObjectID } = require('bson');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wpbfw9p.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const groceryCollection = client.db('superShopGrocery').collection('grocery');

        //Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        //Grocery API

        app.get('/grocery', async (req, res) => {
            const query = {};
            const cursor = groceryCollection.find(query);
            const groceries = await cursor.toArray();
            res.send(groceries);
        });

        app.get('/grocery1', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = groceryCollection.find(query);
                const groceries = await cursor.toArray();
                res.send(groceries);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

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
                $set: {
                    quantity: updateInventory.quantity,
                    sold: updateInventory.sold,
                }
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