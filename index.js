const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();



//----Middleware---
app.use(cors());
app.use(express.json());



var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.dqoas.mongodb.net:27017,cluster0-shard-00-01.dqoas.mongodb.net:27017,cluster0-shard-00-02.dqoas.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-n91z1m-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        console.log('connect to db')
        const productCollection = await client.db('emaJohn').collection('products')



        app.get('/product', async (req, res) => {
            console.log('inside product')
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const query = {};
            const cursor = productCollection.find(query);
            let products
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send(products);


        })
        app.get('/productCount', async (req, res) => {

            const count = await productCollection.estimatedDocumentCount();

            res.send({ count });



        })
        //---------use post to get product------------
        app.post('/productByKeys', async (req, res) => {

            const keys = req.body;
            console.log(keys)
            const ids = keys.map(id => ObjectId(id))
            const query = { _id: { $in: ids } }
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();


            res.send(products);
        })

    }
    finally { }

}
run().catch(console.dir)


app.get('/', (req, res) => {

    res.send('ema-john server')


})

app.listen(port, () => {
    console.log('listening port', port)
})