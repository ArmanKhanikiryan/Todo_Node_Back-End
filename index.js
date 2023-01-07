import express from "express";
import cors from "cors"
import {MongoClient, ObjectId} from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017');


(async function () {
    await client.connect();

    const cleanup = (event) => {
        client.close();
        process.exit();
    }
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    const dataBase = client.db('node_project')
    const collection = dataBase.collection('todos')
    const app = express()

    app.use(express.static('public'))
    app.use(express.json())
    app.use(cors())


    app.get('/todos', async (req, res) => {
        const allTodos = await collection.find({}).toArray()
        res.send(allTodos)
    })

    app.post('/todos', async (req, res) => {

        await collection.insertOne({title: req.body.title, isChecked: false})
        const allTodos = await collection.find({}).toArray()
        res.send(allTodos)
    })

    app.delete('/todos',  async (req, res) => {

        const query = {_id: new ObjectId(req.body._id)}
        await collection.deleteOne(query)
        const allTodos = await collection.find({}).toArray()
        res.send(allTodos)
    })


    app.put('/todos', async (req, res) => {
        const query = {_id: new ObjectId(req.body._id)}
        const todo = await collection.findOne(query)
        const update = {
            $set: {
                "isChecked": !todo.isChecked
            }
        }
        await collection.updateOne(query, update)
        const allTodos = await collection.find({}).toArray()
        res.send(allTodos)
        console.log(allTodos)
    })
    app.listen(3010)

}())

