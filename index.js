const express= require('express');
const cors= require('cors');
const app= express();
require('dotenv').config()
const port= process.env.PORT || 5005;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n2g3mj5.mongodb.net/?retryWrites=true&w=majority`;

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

    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection= client.db('coffeeDB').collection('user');

   // coffee related API'S
    app.get('/coffee', async (req,res)=>{
         const cursor= coffeeCollection.find();
         const result =await cursor.toArray();
         res.send(result);
    })


    app.get('/coffee/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.findOne(query);
        res.send(result);
    });

    app.put('/coffee/:id',async(req,res)=>{
        const id= req.params.id;
        const updatedData= req.body;
        const filter={_id: new ObjectId(id)};
        const options={upsert:true};

        const updatedCoffee={
            $set:{
                name: updatedData.name, 
                quantity: updatedData.quantity, 
                supplier: updatedData.supplier, 
                taste: updatedData.taste, 
                category: updatedData.category, 
                details: updatedData.details,
                photoUrl: updatedData.photoUrl
            }
        }

        const result= await coffeeCollection.updateOne(filter,updatedCoffee,options)
        res.send(result);
    })


    app.post('/coffee', async(req,res)=>{
        const newCoffee= req.body;
        const result= await coffeeCollection.insertOne(newCoffee);
        res.send(result);
    })

    app.delete('/coffee/:id', async(req,res)=>{
        const id= req.params.id;
        const query= {_id: new ObjectId(id)};
        const result= await coffeeCollection.deleteOne(query);
        res.send(result);
    })



    //user related API'S

    app.get('/user',async(req,res)=>{
        const cursor =userCollection.find();
        const result=await cursor.toArray();
        res.send(result);

    })


    app.post('/user',async(req,res)=>{
        const user= req.body;
        console.log(user);
        const result= await userCollection.insertOne(user);
        res.send(result);
    })

    app.patch('/user',async(req,res)=>{
        const user=req.body;
        const filter= {email:user.email};
        const updatedDoc={
            $set:{
                lastLoggedAt:user.lastLoggedAt,
            }
        }
        const result= await userCollection.updateOne(filter,updatedDoc);
        res.send(result);
    })


    app.delete('/user/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)};
        const result=await userCollection.deleteOne(query);
        res.send(result);
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



app.get('/',(req,res)=>{
    res.send('Coffee maker server is running successfully');
})

app.listen(port,(req,res)=>{
    console.log(`Coffee maker server is running on port: ${port}`)
})