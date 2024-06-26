const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// midware
app.use(cors({
    origin: [
        process.env.LOCAL_CLIENT,
        process.env.CLIENT
    ],
    credentials: true
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ewf2fa.mongodb.net/?retryWrites=true&w=majority`;

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
        const database = client.db("Task_management");
        const taskCollection = database.collection("tasks");
        // const userCollection = database.collection("user");
        // // await client.connect();

        // //user
        // // post user
        // app.post('/user', async (req, res) => {
        //     const user = req.body;
        //     const result = await userCollection.insertOne(user);
        //     res.send(result)
        // })

        //task
        //post task
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result)
        })

        //get task
        app.get('/tasks', async (req, res) => {
            try {
                const tasks = await taskCollection.find().toArray();
                res.json(tasks);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        })

        //update task
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const task = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: task.title,
                    description: task.description,
                    deadline: task.deadline,
                    priority: task.priority,
                    status: task.status,
                    email: task.email  // Assuming you want to keep the email with the task
                },
            };
            const result = await taskCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });


        //update status for drop and drag
        app.patch('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const { status } = req.body;

            const updatedTask = await taskCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status } },
                { returnOriginal: false }
            );

            res.send(updatedTask.value);
        });

        //delete task by id
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
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

app.get('/', (req, res) => {
    res.send('The Task Management is running!')
})

app.listen(port, () => {
    console.log(`The Task Management Server is running on port: ${port}`)
})

