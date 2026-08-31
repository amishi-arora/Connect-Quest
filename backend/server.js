require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();
const PORT = process.env.PORT || 3000;

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// -- Helpers --- 
function getTodaysChallengeIndex(totalChallenges) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % totalChallenges;
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
    const challengesResult = await docClient.send(new ScanCommand({ TableName: "Challenges" }));
    const challenges = challengesResult.Items.sort((a, b) => Number(a.id) - Number(b.id));
    const todaysIndex = getTodaysChallengeIndex(challenges.length);
    return challenges[todaysIndex];
}

async function verifyTextAnswer(requirements, answer) {
    const prompt = `You are checking whether a student's submission for a campus challenge satisfies its requirements. 
    Be leneint - if the answer is plausible and reasonably shows the requirements were met, approve it. 
    Reject if the answer is clearly unrelated, empty of real content, or obviously does not attempt to meet the requirements.

Requirements:
${requirements.map((r) => `- ${r}`).join("\n")}

Student's answer:
"${answer}"

Respond with ONLY a JSON object, no other text, no markdown, no code fences, in this exact format:
{"approved": true or false, "reason": "one short sentence explaining why"}`;

    const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            messages: [{ role: "user", content: [{ text: prompt }] }],
            inferenceConfig: { maxTokens: 200, temperature: 0.2 },
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

// --- Authorization --- 
const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function verifyPhotoAnswer(requirements, base64Image) {
    const prompt = `You are checking whether a photo satisfies a campus challenge's requirements. 
    Be Lenient — if the photo plausibly shows what was asked for, approve it. 
    Rject if the photo is clearly unrelated or doesn't attempt to show what was requested.

Requirements:
${requirements.map((r) => `- ${r}`).join("\n")}

Respond with ONLY a JSON object, no other text, no markdown, no code fences, in this exact format:
{"approved": true or false, "reason": "one short sentence explaining why"}`;

    const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            messages: [
                {
                    role: "user",
                    content: [
                        { image: { format: "jpeg", source: { bytes: base64Image } } },
                        { text: prompt },
                    ],
                },
            ],
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

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// --- Routes ---
app.post("/api/confirm-user", async (req, res) => {
    const { email } = req.body;
    try {
        await cognitoClient.send(
            new AdminConfirmSignUpCommand({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: email,
            })
        );
        res.json({ confirmed: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

app.get("/api/challenges", async (req, res) => {
    try {
        const result = await docClient.send(new ScanCommand({ TableName: "Challenges" }));
        res.json(result.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
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
        res.json(result.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/challenges/:id/submit", verifyCognitoToken, async (req, res) => {
    const challengeId = req.params.id;
    const { submission } = req.body;

    try {
        const challengeResult = await docClient.send(
            new GetCommand({
                TableName: "Challenges",
                Key: { id: challengeId },
            })
        );
        const challenge = challengeResult.Item;

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        let verification;
        if (challenge.submissionType === "photo") {
            verification = await verifyPhotoAnswer(challenge.requirements, submission);
        } else {
            verification = await verifyTextAnswer(challenge.requirements, submission);
        }

        if (!verification.approved) {
            return res.status(422).json({
                message: "Your submission doesn't quite match the requirements.",
                reason: verification.reason,
            });
        }

        let photoKey = null;
        if (challenge.submissionType === "photo") {
            photoKey = await uploadPhotoToS3(req.user.sub, challengeId, submission);
        }


        await docClient.send(
            new PutCommand({
                TableName: "UserProgress",
                Item: {
                    userId: req.user.sub,
                    challengeId,
                    status: "completed",
                    answer: challenge.submissionType === "photo" ? null : submission,
                    photoKey,
                    completedAt: new Date().toISOString(),
                },
            })
        );

        const todaysChallenge = await getTodaysChallenge();
        if (todaysChallenge.id === challengeId) {
            const today = getDateString(new Date());
            const yesterday = getYesterdayString();

            const streakResult = await docClient.send(
                new GetCommand({ TableName: "UserStreaks", Key: { userId: req.user.sub } })
            );
            const existing = streakResult.Item;

            const newStreak = existing?.lastCompletedDate === yesterday ? existing.currentStreak + 1 : 1;

            await docClient.send(
                new PutCommand({
                    TableName: "UserStreaks",
                    Item: {
                        userId: req.user.sub,
                        currentStreak: newStreak,
                        lastCompletedDate: today,
                    },
                })
            );
        }

        res.json({ success: true, pointsEarned: challenge.points });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
    }
});

// -- Start Server --- 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
