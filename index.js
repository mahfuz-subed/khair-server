import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("khairDB");
const eventsCollection = db.collection("events");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/events", async (req, res) => {
  const today = new Date();
  const homepageEvents = await eventsCollection
    .find({ eventDate: { $gt: today } })
    .sort({ eventData: 1 })
    .limit(6)
    .toArray();
  res.send(homepageEvents);
});

app.post("/add-event", async (req, res) => {
  const data = req.body;
  data.eventDate = new Date(data.eventDate);
  const result = await eventsCollection.insertOne(data);
  res.send(result);
});

app.get("/upcoming-events", async (req, res) => {
  const today = new Date();
  const upcomingEvents = await eventsCollection
    .find({ eventDate: { $gt: today } })
    .sort({ eventData: 1 })
    .toArray();
  res.send(upcomingEvents);
});

app.get("/event/:id", async (req, res) => {
  const { id } = req.params;
  const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.get("/my-events/:createdBy", async (req, res) => {
  const { createdBy } = req.params;
  const result = await eventsCollection
    .find({ createdBy: createdBy })
    .toArray();
  res.send(result);
});

app.patch("/my-events/:id", async (req, res) => {
  const { id } = req.params;
  const { _id, ...updatedData } = req.body;
  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData },
  );
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
