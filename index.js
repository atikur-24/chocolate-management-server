const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.SECRET_KEY}@cluster0.28gkq0d.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("chocolateDB");
    const chocolateCollection = database.collection("chocolates");

    // READ
    app.get('/chocolates', async(req, res) => {
      const cursor = chocolateCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/chocolates/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await chocolateCollection.findOne(query);
      res.send(result);
    });

    // CREATE
    app.post('/chocolates', async(req, res) => {
      const newChocolates = req.body;     
      const result = await chocolateCollection.insertOne(newChocolates);
      res.send(result);
    });

    //UPDATE
    app.put('/chocolates/:id', async(req, res) => {
      const id = req.params.id;
      const updateChocolate = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const chocolate = {
        $set: {
          name: updateChocolate.name,
          country: updateChocolate.country,
          photo: updateChocolate.photo,
          category: updateChocolate.category
        }
      };
      const result = await chocolateCollection.updateOne(filter, chocolate, options);
      res.send(result);
    })

    // DELETE
    app.delete('/chocolates/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await chocolateCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Chocolate Management Server is Running....')
});

app.listen(port, () => {
    console.log(`Chocolate management server is running on port ${port}`);
})