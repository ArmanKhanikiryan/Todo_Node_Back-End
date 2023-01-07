import express from "express";
import cors from "cors"
import {MongoClient, ObjectId} from 'mongodb'
import mongoose, {Schema} from "mongoose";
const client = new MongoClient('mongodb://localhost:27017');
(async function () {
    await client.connect();

    mongoose.set("strictQuery", false);
    mongoose.connect('mongodb://localhost:27017', () => {
    });

    mongoose.set('strictQuery', true)

    let TodoSchema = new Schema({
        title: {
            type: String,
            required: true,
        },
        isChecked: {
            type: Boolean,
            required: true
        }
    }, {timestamps: true})

    const TodoModel = mongoose.model("Todo", TodoSchema);

    const cleanup = (event) => {
        client.close();
        process.exit();
    }
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);


    // const dataBase = TodoModel.db
    // const collection = TodoModel.collection
    // collection.collectionName = 'Mongoose_Todo'
    const app = express()


    app.use(express.static('public'))
    app.use(express.json())
    app.use(cors())


    app.get('/todos', async (req, res) => {
        const allTodos = await TodoModel.find()
        res.status(200).json(allTodos)
    })

    app.post('/todos', async (req, res) => {

        const newTodo = new TodoModel({
            title: req.body.title,
            isChecked: false
        })
        await newTodo.save()
        const allTodos = await TodoModel.find()
        res.send(allTodos)

        // await collection.insertOne({title: req.body.title, isChecked: false})
        // const allTodos = await collection.find({}).toArray()
        // console.log(allTodos, 'ALL')
        // res.send(allTodos)
    })

    app.delete('/todos',  async (req, res) => {


        await TodoModel.findByIdAndDelete(req.body._id)
        const allTodos = await TodoModel.find()
        res.send(allTodos)

        // const query = {_id: new ObjectId(req.body._id)}
        // await collection.deleteOne(query)
        // const allTodos = await collection.find({}).toArray()
        // res.send(allTodos)
    })


    app.put('/todos', async (req, res) => {

        const todo = await TodoModel.findById(req.body._id)
        const update = {
            isChecked: !todo.isChecked
        }
        await TodoModel.findByIdAndUpdate(req.body._id, update)
        const allTodos = await TodoModel.find()
        res.send(allTodos)
        // const query = {_id: new ObjectId(req.body._id)}
        // const todo = await collection.findOne(query)
        // const update = {
        //     $set: {
        //         "isChecked": !todo.isChecked
        //     }
        // }
        // await collection.updateOne(query, update)
        // const allTodos = await collection.find({}).toArray()
        // res.send(allTodos)
    })
    app.listen(3010)

}())

