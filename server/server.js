import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// --- Firebase Admin Setup ---
const firebaseConfig = {
  projectId: "edufinanceai",
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "edufinanceai"
    });
  } catch (e) {
    console.warn("⚠️ Firebase Admin initialization failed. Firestore context will be disabled.");
  }
}

let firestoreDb;
try {
  firestoreDb = admin.firestore();
} catch (e) {
  console.warn("⚠️  Firestore Admin not available (OK for dev). User data personalization disabled.");
  firestoreDb = null;
}

// --- Gemini AI Setup ---
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are a knowledgeable and friendly EduFinance AI Assistant specialized in loans, scholarships, and academic financing.

Your main purpose:
- Help users understand their eligibility for education loans and scholarships.
- Explain terms like Interest Rates, Moratorium Periods, Collateral, and Repayment Plans.
- Guide users on application steps for specific scholarships.
- Provide simple explanations for financial documents.

Core behavior:
- Be encouraging and supportive for students and parents.
- Break down complex financial terms into simple, understandable language.
- Use bullet points for steps or requirements.
- If a user asks about their specific status, use any provided user data to personalize the answer.
- Always clarify that you are an AI assistant and they should verify final details with their bank or official scholarship provider.
`;

const app = express();
app.use(cors());
app.use(express.json());

// --- Fetch user context from Firestore ---
async function getUserContext(userId) {
  if (!firestoreDb || !userId) return null;
  
  try {
    const context = {};
    
    // Fetch loan application data
    const loanDoc = await firestoreDb.collection('loanApplications').doc(userId).get();
    if (loanDoc.exists) {
      const data = loanDoc.data();
      context.loanApp = {
        status: data.status,
        courseName: data.academicInfo?.courseName,
        collegeName: data.academicInfo?.collegeName,
        loanAmount: data.bankLoanInfo?.loanAmount,
        annualIncome: data.familyInfo?.annualIncome,
        category: data.personalInfo?.category,
        name: data.personalInfo?.name,
      };
    }

    // Fetch scholarship application data
    const schDoc = await firestoreDb.collection('scholarshipApplications').doc(userId).get();
    if (schDoc.exists) {
      const data = schDoc.data();
      context.scholarshipApp = {
        status: data.status,
        course: data.academicInfo?.course,
        instName: data.academicInfo?.instName,
        percentage: data.academicInfo?.percentage,
        category: data.personalInfo?.category,
        name: data.personalInfo?.name,
        district: data.personalInfo?.district,
      };
    }

    return Object.keys(context).length > 0 ? context : null;
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

// --- Chat History for context ---
const chatHistories = new Map();

// --- /chat endpoint ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, userEmail, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({ 
        error: 'API key not configured',
        response: "⚠️ The AI assistant is not configured yet. Please add your Gemini API key in server/.env file. Get one free at https://aistudio.google.com/apikey"
      });
    }

    // Get user context from Firestore
    const userContext = await getUserContext(userId);

    // Build personalization prompt
    let personalizationPrompt = '';
    if (userContext) {
      personalizationPrompt = `\n\n## CURRENT USER DATA (use this to personalize your response):\n`;
      if (userContext.loanApp) {
        const l = userContext.loanApp;
        personalizationPrompt += `- Loan Application: ${l.status || 'N/A'}, Course: ${l.courseName || 'N/A'}, College: ${l.collegeName || 'N/A'}, Amount: ₹${l.loanAmount || 'N/A'}, Income: ₹${l.annualIncome || 'N/A'}/year, Category: ${l.category || 'N/A'}\n`;
      }
      if (userContext.scholarshipApp) {
        const s = userContext.scholarshipApp;
        personalizationPrompt += `- Scholarship Application: ${s.status || 'N/A'}, Course: ${s.course || 'N/A'}, College: ${s.instName || 'N/A'}, Marks: ${s.percentage || 'N/A'}%, Category: ${s.category || 'N/A'}, District: ${s.district || 'N/A'}\n`;
      }
    }
    if (userName) personalizationPrompt += `- User Name: ${userName}\n`;
    if (userEmail) personalizationPrompt += `- User Email: ${userEmail}\n`;

    // Get or create chat history
    const historyKey = userId || 'anonymous';
    if (!chatHistories.has(historyKey)) {
      chatHistories.set(historyKey, []);
    }
    const history = chatHistories.get(historyKey);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT + personalizationPrompt,
    });

    // Create chat with history
    const chat = model.startChat({
      history: history.slice(-10), // Keep last 10 messages for context
    });

    // Send message
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Update history
    history.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: aiResponse }] }
    );

    // Limit history size
    if (history.length > 20) {
      chatHistories.set(historyKey, history.slice(-20));
    }

    res.json({ 
      response: aiResponse,
      personalized: !!userContext
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check for Gemini/API errors
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({ 
        response: "⚠️ Invalid Gemini API Key. Please check your key in `server/.env`"
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ 
        response: "⚠️ Gemini API Rate Limit reached. Please wait a moment."
      });
    }

    res.status(500).json({ 
      response: "I'm having trouble connecting to Gemini AI. Please check your internet and API key."
    });
  }
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ai: GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? 'configured' : 'not configured',
    firestore: firestoreDb ? 'connected' : 'not available'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n🚀 EduFinance AI Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/api/health`);
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log(`\n⚠️  REACT_APP_GEMINI_API_KEY not set! Get one free at: https://aistudio.google.com/apikey`);
    console.log(`   Then add it to server/.env`);
  } else {
    console.log(`✅ Gemini AI connected`);
  }
});
