import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Create a GET route at /grades/stats
// Within this route, create an aggregation pipeline that returns the following information:

// The number of learners with a weighted average (as calculated by the existing routes) higher than 70%.
{$match:{
    avg: >70

}}
{$count:"numberOfqulified"}    
// The total number of learners.
{search:{
    text:{
        path:""
        query:""
    }
}}
{$count:"numberOfLearners"}
// The percentage of learners with an average above 70% (a ratio of the above two outputs).
{$divide:{
$count:"numberOfqulified" / $count:"numberOfLearners"
}

}
// Create a GET route at /grades/stats/:id
// Within this route, mimic the above aggregation pipeline, but only for learners within a class that has a class_id equal to the specified :id.
// Create a single-field index on class_id.

// Create a single-field index on learner_id.

// Create a compound index on learner_id and class_id, in that order, both ascending.

// Create the following validation rules on the grades collection:


// Each document must have a class_id field, which must be an integer between 0 and 300, inclusive.

// Each document must have a learner_id field, which must be an integer greater than or equal to 0.

// Change the validation action to "warn."


// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {
  let collection = await db.collection("grades");

  let result = await collection
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ])
    .toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
