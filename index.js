require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json())

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const database = client.db('petsNSupplies');
        const petSuppliesCollection = database.collection('listings');
        const ordersCollection = database.collection('orders');

        // save listing to database
        app.post('/listings', async (req, res) => {
            const data = req.body;
            const date = new Date();
            data.createdAt = date;
            // console.log(data);
            const result = await petSuppliesCollection.insertOne(data);
            res.send(result);

        })

        // get listings from database
        app.get('/listings', async (req, res) => {
            const { category, limit } = req.query;
            console.log(req.query);
            
            const query = {};
            if (category) {
                query.category = category;
            }
            let listings = petSuppliesCollection.find(query);

            if (limit) {
                const limitNumber = parseInt(limit);
                listings = listings.limit(limitNumber);
            }

            const result = await listings.toArray()
            res.send(result);
        })

        // get specific listing
        app.get('/listing/:id', async (req, res) => {
            const { id } = req.params;
            // console.log(id);

            const query = { _id: new ObjectId(id) };
            const result = await petSuppliesCollection.findOne(query);
            res.send(result)

        })

        // get my listings
        app.get('/my-listings', async (req, res) => {
            const { email } = req.query;
            const query = { email: email };
            const result = await petSuppliesCollection.find(query).toArray();
            res.send(result);

        })

        // edit listing
        app.put('/update/:id', async (req, res) => {
            const data = req.body;
            const { id } = req.params;
            // console.log(data);
            const query = { _id: new ObjectId(id) };
            const updatedService = {
                $set: data
            };
            const result = await petSuppliesCollection.updateOne(query, updatedService);
            res.send(result);
        })


        // delete one listing
        app.delete('/delete/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) };
            const result = await petSuppliesCollection.deleteOne(query);
            res.send(result);
        })

        // make an order
        app.post('/order', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await ordersCollection.insertOne(data);
            res.status(201).send(result);

        })
        // get my orders
        app.get('/orders', async (req, res) => {
            const { email } = req.query;
            const query = { buyerEmail: email };
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello developers');
})

app.listen(port, () => {
    console.log(`server is running at ${port}`);
})