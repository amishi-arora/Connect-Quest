require("dotenv").config();
const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();
const PORT = process.env.PORT || 3000;
const TOTAL_CHALLENGES = 20;

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// -- Helpers --- 
class SubmissionError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function getTodaysChallengeId(totalChallenges) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    return String(((dayOfYear - 1) % totalChallenges) + 1);
}

function getDateString(date) {
    return date.toISOString().split("T")[0];
}

function getYesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getDateString(d);
}

async function getTodaysChallenge() {
    const challengeId = getTodaysChallengeId(TOTAL_CHALLENGES);

    const result = await docClient.send(
        new GetCommand({
            TableName: "Challenges",
            Key: { id: challengeId },
        })
    );

    return result.Item;
}

async function callNovaForVerification(contentArray) {
    const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            messages: [{ role: "user", content: contentArray }],
            inferenceConfig: { maxTokens: 200, temperature: 0 },
        }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const rawText = responseBody.output.message.content[0].text;

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error("No JSON found in Nova response:", rawText);
        throw new Error("AI verification returned an unparseable response");
    }
    return JSON.parse(jsonMatch[0]);
}

async function verifyTextAnswer(requirements, answer) {
    const prompt = `You are checking whether a student's submission for a campus challenge satisfies its requirements. 
    be lenient - if the answer is plausible and reasonably shows the requirements were met, approve it. 
    Reject if the answer is clearly unrelated, empty of real content, or obviously does not attempt to meet the requirements.

Requirements:
${requirements.map((r) => `- ${r}`).join("\n")}

Student's answer:
"${answer}"

If you reject the submission, your reason must be specific and reference the student's actual answer — for example, 
name which exact requirement wasn't addressed, or quote/paraphrase what they wrote and explain what's missing from it. 
Do NOT write generic reasons. Write the reason in a warm, encouraging tone — like a friendly peer giving quick feedback, 
not a strict grader. Still be specific and concrete about what's missing, as instructed above.

Before rejecting, re-read the answer carefully to make sure your stated reason is actually accurate.

Respond with ONLY a JSON object, no other text, no markdown, no code fences, in this exact format:
{"approved": true or false, "reason": "one short sentence explaining why"}`;
    return callNovaForVerification([{ text: prompt }]);
}

async function verifyPhotoAnswer(requirements, base64Image) {
    const prompt = `You are checking whether a photo satisfies a campus challenge's requirements. 
    be lenient — if the photo plausibly shows what was asked for, approve it. 
    Reject if the photo is clearly unrelated or doesn't attempt to show what was requested.

Requirements:
${requirements.map((r) => `- ${r}`).join("\n")}

If you reject the submission, your reason must be specific and reference the student's actual answer — for example, 
name which exact requirement wasn't addressed, or quote/paraphrase what they wrote and explain what's missing from it. 
Do NOT write generic reasons. Write the reason in a warm, encouraging tone — like a friendly peer giving quick feedback, 
not a strict grader. Still be specific and concrete about what's missing, as instructed above.

Before rejecting, re-read the answer carefully to make sure your stated reason is actually accurate.

Respond with ONLY a JSON object, no other text, no markdown, no code fences, in this exact format:
{"approved": true or false, "reason": "one short sentence explaining why"}`;
    return callNovaForVerification([
        { image: { format: "jpeg", source: { bytes: base64Image } } },
        { text: prompt },
    ]);
}

async function verifySubmission(challenge, submission) {
    if (challenge.submissionType === "photo") {
        if (!isValidImageBase64(submission)) {
            throw new SubmissionError(400, "Invalid image. Please upload a JPEG or PNG photo.");
        }
        return verifyPhotoAnswer(challenge.requirements, submission);
    }
    if (challenge.submissionType === "text") {
        if (typeof submission !== "string") {
            throw new SubmissionError(400, "Please provide a valid text answer.");
        }
        if (submission.length > 500) {
            throw new SubmissionError(400, "Your answer is too long — please keep it under 500 characters.");
        }
        return verifyTextAnswer(challenge.requirements, submission);
    }
    throw new SubmissionError(500, "This challenge is misconfigured.");
}

async function updateStreakIfDaily(userId, challengeId) {
    const todaysChallengeId = (await getTodaysChallenge()).id;
    if (todaysChallengeId !== challengeId) return;

    const today = getDateString(new Date());
    const yesterday = getYesterdayString();
    const streakResult = await docClient.send(
        new GetCommand({ TableName: "UserStreaks", Key: { userId } })
    );
    const existing = streakResult.Item;
    const newStreak = existing?.lastCompletedDate === yesterday ? existing.currentStreak + 1 : 1;

    await docClient.send(
        new PutCommand({
            TableName: "UserStreaks",
            Item: { userId, currentStreak: newStreak, lastCompletedDate: today },
        })
    );
}

async function getChallenge(challengeId) {
    const result = await docClient.send(
        new GetCommand({ TableName: "Challenges", Key: { id: challengeId } })
    );
    return result.Item;
}

async function handlePhotoUpload(userId, challengeId, base64Image) {
    const photoKey = await uploadPhotoToS3(userId, challengeId, base64Image);
    const photoUrl = await getPhotoUrl(photoKey);
    return { photoKey, photoUrl };
}

async function saveProgress(userId, challengeId, submission, submissionType, photoKey) {
    await docClient.send(
        new PutCommand({
            TableName: "UserProgress",
            Item: {
                userId,
                challengeId,
                status: "completed",
                answer: submissionType === "photo" ? null : submission,
                photoKey,
                completedAt: new Date().toISOString(),
            },
            ConditionExpression: "attribute_not_exists(userId)",
        })
    );
}

async function uploadPhotoToS3(userId, challengeId, base64Image) {
    const buffer = Buffer.from(base64Image, "base64");
    const key = `${userId}/${challengeId}.jpg`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: "image/jpeg",
        })
    );

    return key;
}

function isValidImageBase64(base64String) {
    try {
        const buffer = Buffer.from(base64String, "base64");

        // Reject anything absurdly large
        if (buffer.length > 5 * 1024 * 1024) {
            return false;
        }

        // Check magic bytes — real JPEGs and PNGs start with a specific byte signature
        const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

        return isJpeg || isPng;
    } catch {
        return false;
    }
}

async function getPhotoUrl(photoKey) {
    return getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: photoKey,
        }),
        { expiresIn: 3600 }
    );
}

// --- Authorization --- 
const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function verifyCognitoToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or malformed authorization header" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = await jwtVerifier.verify(token);
        req.user = { sub: payload.sub, email: payload.email, name: payload.name };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

// --- Middleware ---
app.use(cors());
app.use(helmet())
app.use(express.json({ limit: "10mb" }));

// --- Routes ---
app.get("/api/challenges", verifyCognitoToken, async (req, res) => {
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Challenges" }));
        res.json(result.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

app.get("/api/progress", verifyCognitoToken, async (req, res) => {
    try {
        const result = await docClient.send(
            new QueryCommand({
                TableName: "UserProgress",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: { ":userId": req.user.sub },
            })
        );

        const itemsWithUrls = await Promise.all(
            result.Items.map(async (item) => {
                if (item.photoKey) {
                    const url = await getPhotoUrl(item.photoKey);
                    return { ...item, photoUrl: url };
                }
                return item;
            })
        );

        res.json(itemsWithUrls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

app.post("/api/challenges/:id/submit", verifyCognitoToken, async (req, res) => {
    const challengeId = req.params.id;
    const { submission } = req.body;
    if (!submission) {
        return res.status(400).json({ message: "No submission provided." });
    }

    try {
        const challenge = await getChallenge(challengeId);
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });

        const verification = await verifySubmission(challenge, submission);
        if (!verification.approved) {
            return res.status(422).json({ message: "Your submission doesn't quite match the requirements.", reason: verification.reason });
        }

        const { photoKey, photoUrl } = challenge.submissionType === "photo"
            ? await handlePhotoUpload(req.user.sub, challengeId, submission)
            : { photoKey: null, photoUrl: null };

        await saveProgress(req.user.sub, challengeId, submission, challenge.submissionType, photoKey);
        await updateStreakIfDaily(req.user.sub, challengeId);

        res.json({ success: true, pointsEarned: challenge.points, photoUrl });
    } catch (err) {
        if (err instanceof SubmissionError) {
            return res.status(err.status).json({ message: err.message });
        }

        if (err.name === "ConditionalCheckFailedException") {
            return res.status(409).json({ message: "You've already completed this challenge." });
        }
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

app.get("/api/daily-challenge", verifyCognitoToken, async (req, res) => {
    try {
        const todaysChallenge = await getTodaysChallenge();

        const progressResult = await docClient.send(
            new QueryCommand({
                TableName: "UserProgress",
                KeyConditionExpression: "userId = :userId AND challengeId = :challengeId",
                ExpressionAttributeValues: {
                    ":userId": req.user.sub,
                    ":challengeId": todaysChallenge.id,
                },
            })
        );
        const streakResult = await docClient.send(
            new GetCommand({ TableName: "UserStreaks", Key: { userId: req.user.sub } })
        );
        const streakData = streakResult.Item;

        const today = getDateString(new Date());
        const yesterday = getYesterdayString();

        let displayStreak = 0;
        if (streakData?.lastCompletedDate === today || streakData?.lastCompletedDate === yesterday) {
            displayStreak = streakData.currentStreak;
        }

        res.json({
            challenge: todaysChallenge,
            completed: progressResult.Items.length > 0,
            streak: displayStreak,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

// -- Start Server --- 
module.exports.handler = serverless(app);
