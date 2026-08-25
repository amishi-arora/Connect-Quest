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
  {
    id: "6",
    title: "Try a new dining hall dish",
    description: "Step outside your usual order and try something you've never eaten before.",
    points: 5,
    requirements: [
      "Order or try a dish you've never had before.",
      "Eat at least a full portion.",
      "Rate it out of 5 stars.",
    ],
  },
  {
    id: "7",
    title: "Attend a guest lecture",
    description: "Sit in on a talk or lecture outside your usual classes.",
    points: 15,
    requirements: [
      "Find a guest lecture or open talk happening on campus.",
      "Attend the full session.",
      "Share one thing you learned.",
    ],
  },
  {
    id: "8",
    title: "Visit the career center",
    description: "Stop by the career center to check out available resources.",
    points: 10,
    requirements: [
      "Visit the career center in person.",
      "Ask about one resource (resume review, job board, etc.).",
      "Note what you found out.",
    ],
  },
  {
    id: "9",
    title: "Join an intramural sport",
    description: "Sign up for or attend an intramural sports session.",
    points: 15,
    requirements: [
      "Find an intramural team or drop-in session.",
      "Participate in one game or practice.",
      "Describe how it went.",
    ],
  },
  {
    id: "10",
    title: "Sit with someone new at a meal",
    description: "Instead of eating alone or with the same group, sit with someone new.",
    points: 10,
    requirements: [
      "Sit with at least one person you don't usually eat with.",
      "Have a conversation during the meal.",
      "Share their name and one thing about them.",
    ],
  },
  {
    id: "11",
    title: "Visit the library's quiet study floor",
    description: "Find a focused study spot in the library you haven't used before.",
    points: 5,
    requirements: [
      "Locate a study floor or room you haven't studied in before.",
      "Study there for at least 30 minutes.",
      "Rate how good it was for focus.",
    ],
  },
  {
    id: "12",
    title: "Attend a club info fair or tabling event",
    description: "Check out a student org fair or tabling event on campus.",
    points: 10,
    requirements: [
      "Visit at least 3 different tables or booths.",
      "Ask a question at one of them.",
      "Note which one interested you most.",
    ],
  },
  {
    id: "13",
    title: "Go to a professor's office hours",
    description: "Attend office hours for one of your classes, even just to say hi.",
    points: 10,
    requirements: [
      "Attend a professor or TA's office hours.",
      "Ask at least one question.",
      "Note what you talked about.",
    ],
  },
  {
    id: "14",
    title: "Attend a cultural or performance event",
    description: "Go to a cultural showcase, concert, or performance on campus.",
    points: 15,
    requirements: [
      "Attend a cultural event, concert, or performance.",
      "Stay for the full event.",
      "Share your favorite part.",
    ],
  },
  {
    id: "15",
    title: "Use the campus gym or rec center",
    description: "Get a workout in at the campus gym or recreation center.",
    points: 10,
    requirements: [
      "Visit the gym or rec center.",
      "Complete a workout of at least 20 minutes.",
      "Note what you did.",
    ],
  },
  {
    id: "16",
    title: "Photograph a piece of campus architecture",
    description: "Find and photograph a building or structure with interesting design.",
    points: 5,
    requirements: [
      "Find a building or structure on campus you find visually interesting.",
      "Take a photo of it.",
      "Note what stood out to you.",
    ],
  },
  {
    id: "17",
    title: "Volunteer for a campus event",
    description: "Help out at or volunteer for an event happening on campus.",
    points: 20,
    requirements: [
      "Find a volunteer opportunity for a campus event.",
      "Complete at least one shift or task.",
      "Describe what you helped with.",
    ],
  },
  {
    id: "18",
    title: "Try a campus wellness resource",
    description: "Check out a wellness or mental health resource available to students.",
    points: 10,
    requirements: [
      "Visit or attend a wellness resource (counseling center, meditation session, etc.).",
      "Participate in the full session or visit.",
      "Share how it felt.",
    ],
  },
  {
    id: "19",
    title: "Watch the sunset or sunrise on campus",
    description: "Find a good spot on campus to watch the sunset or sunrise.",
    points: 5,
    requirements: [
      "Find a spot on campus with a good view.",
      "Watch the sunset or sunrise from there.",
      "Take a photo or describe it.",
    ],
  },
  {
    id: "20",
    title: "Start a study group of your own",
    description: "Instead of joining one, organize a study group for a class you're in.",
    points: 15,
    requirements: [
      "Invite at least 2 classmates to a study session.",
      "Hold the session for at least 30 minutes.",
      "Note what you covered.",
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