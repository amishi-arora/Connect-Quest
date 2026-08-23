require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const challenges = [
  {
    id: "1",
    title: "Join a study group",
    description: "Participate in a study group to enhance your learning experience.",
    points: 10,
    requirements: [
      "Find or create a study group with at least 2 other people.",
      "Attend one full session.",
      "Note what you studied.",
    ],
  },
  {
    id: "2",
    title: "Explore a new campus spot",
    description: "Discover a new location on campus you've never visited before.",
    points: 5,
    requirements: [
      "Select a location you have never been to on campus.",
      "Spend at least 10 minutes there.",
      "Take a photo or make a note of what you discovered.",
    ],
  },
  {
    id: "3",
    title: "Participate in a club event",
    description: "Engage in a club activity to broaden your social network and skills.",
    points: 15,
    requirements: [
      "Attend a club meeting or event.",
      "Talk to at least one new person.",
      "Describe what the event was about.",
    ],
  },
  {
    id: "4",
    title: "Make a new friend",
    description: "Strike up a conversation and connect with someone new on campus.",
    points: 10,
    requirements: [
      "Introduce yourself to someone you haven't met before.",
      "Have a conversation of at least 5 minutes.",
      "Share how you met.",
    ],
  },
  {
    id: "5",
    title: "Snap a photo of campus art",
    description: "Find and photograph a piece of art displayed somewhere on campus.",
    points: 10,
    requirements: [
      "Find a piece of art displayed somewhere on campus.",
      "Take a photo of it.",
      "Note where you found it.",
    ],
  },
];

async function seed() {
  for (const challenge of challenges) {
    await docClient.send(
      new PutCommand({
        TableName: "Challenges",
        Item: challenge,
      })
    );
    console.log(`Seeded: ${challenge.title}`);
  }
  console.log("Done seeding Challenges table.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
});