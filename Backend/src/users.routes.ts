import * as express from 'express';
import { ObjectId } from 'mongodb';
import { collections } from './database';

export const usersRouter = express.Router();
usersRouter.use(express.json());

usersRouter.get("/", async (req, res) => {
    try{
        const users = await collections?.users?.find({}).toArray();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

usersRouter.get("/:id", async (req, res) => {
    try{
        const userId = req?.params?.id;
        const query = { _id: new ObjectId(userId) };
        const user = await collections?.users?.findOne(query);
        if (user) {
            res.status(200).send(user);
        }
        else{
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(404).send(error instanceof Error ? error.message : "Unknown error");
    }
});

usersRouter.post("/", async (req, res) => {
    try{
        const user = req.body;
        const result = await collections?.users?.insertOne(user);
        if (result?.acknowledged) {
            res.status(201).send(result.insertedId);
        } else {
            res.status(500).send("Failed to create user");
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

usersRouter.put("/:id", async (req, res) => {
    try{
        const userId = req?.params?.id;
        const query = { _id: new ObjectId(userId) };
        const update = { $set: req.body };
        const result = await collections?.users?.updateOne(query, update);
        if (result && result.matchedCount ) {
            res.status(200).send("User updated successfully");
        } else if (!result?.matchedCount) {
            res.status(404).send("User not found");
        } else {
            res.status(500).send("Failed to update user");
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

usersRouter.delete("/:id", async (req, res) => {
    try{
        const userId = req?.params?.id;
        const query = { _id: new ObjectId(userId) };
        const result = await collections?.users?.deleteOne(query);
        if (result && result.deletedCount) {
            res.status(200).send("User deleted successfully");
        } else if (!result?.deletedCount) {
            res.status(404).send("User not found");
        } else {
            res.status(500).send("Failed to delete user");
        }
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});