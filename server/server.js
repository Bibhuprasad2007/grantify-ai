import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import path from 'path';
import Tesseract from 'tesseract.js';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
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
app.use(express.json({ limit: '20mb' }));

// ============================================================
// --- DOCUMENT VERIFICATION PROMPT ---
// ============================================================
const DOC_VERIFY_PROMPT = `You are a strict Indian document verification expert AI for an education loan & scholarship platform.

## YOUR TASK
Analyze the uploaded document image/PDF and extract identity information from it.

## DOCUMENT TYPES YOU CAN VERIFY
- Aadhar Card (UIDAI issued, 12-digit number)
- PAN Card (10-character alphanumeric)
- 10th Certificate / Marksheet
- 12th Certificate / Marksheet
- Income Certificate
- Father's/Mother's Aadhar Card
- Bank Passbook
- Bank CV Document
- College ID Card
- Bonafide Certificate
- Fee Structure
- Ration Card
- Passport Size Photo
- Last Exam Marksheet

## EXTRACTION RULES
1. Extract ALL readable text fields from the document.
2. Identify the document type from the image.
3. For identity documents (Aadhar, PAN, Certificates), extract: Full Name, Father's Name (if available), Date of Birth (if available), Document Number (if available).
4. For Passport Photo: just confirm it is a valid passport-size photograph of a person.
5. For bank documents: extract Account Holder Name, Account Number, IFSC (if visible).
6. For academic documents: extract Student Name, Institution, Course, Year/Semester, Marks/Grade.

## VALIDATION RULES
- Check if the document appears genuine (not blurred, not cropped badly, readable).  
- Check if the document type matches what the user claims it is (provided in "expectedDocType").
- If a "referenceUserName" is provided, check if the name on the document reasonably matches it (allow minor variations like initials, middle name differences).
- If "verifiedAadharData" is provided, cross-check the name/father's name with it to confirm same person.

## OUTPUT FORMAT
You MUST respond with ONLY valid JSON (no markdown, no backticks, no explanation). Use this exact structure:
{
  "verified": true or false,
  "confidence": 0-100,
  "documentType": "detected document type",
  "extractedData": {
    "name": "extracted full name or null",
    "fatherName": "extracted father name or null",
    "dob": "extracted date of birth or null",
    "documentNumber": "extracted doc number or null",
    "institution": "college/school name or null",
    "course": "course or class name or null",
    "accountNumber": "bank account or null",
    "ifsc": "IFSC code or null",
    "additionalFields": {}
  },
  "nameMatchResult": {
    "matches": true or false,
    "documentName": "name from document",
    "referenceName": "name to compare with",
    "reason": "brief explanation"
  },
  "crossCheckResult": {
    "matches": true or false,
    "reason": "comparison with previously verified Aadhar data"
  },
  "rejectionReasons": ["list of reasons if rejected, empty array if verified"],
  "qualityScore": 0-100,
  "summary": "one-line human-readable summary"
}`;

// ============================================================
// --- DOCUMENT VERIFICATION ENDPOINT ---
// ============================================================
app.post('/api/verify-document', async (req, res) => {
  try {
    let { 
      imageBase64,       // base64 encoded image data
      fileUrl,           // direct URL to the file
      mimeType,          // e.g. "image/jpeg", "image/png", "application/pdf"
      expectedDocType,   // e.g. "Aadhar Card", "PAN Card"
      referenceUserName, // user's display name from Google profile
      referenceUserEmail,// user's email
      userId,            // user's UID
      verifiedAadharData // previously verified Aadhar data (if any)
    } = req.body;

    if (!imageBase64 && !fileUrl) {
      return res.status(400).json({ error: 'Image data or File URL is required' });
    }

    // --- Fetch from URL if provided ---
    if (fileUrl && !imageBase64) {
      console.log(`🌐 Fetching file from URL: ${fileUrl}...`);
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = buffer.toString('base64');
        if (!mimeType) {
          mimeType = response.headers.get('content-type');
        }
        console.log(`✅ File fetched successfully. Size: ${Math.round(buffer.length/1024)} KB`);
      } catch (fetchErr) {
        console.error('❌ Failed to fetch file from URL:', fetchErr.message);
        return res.status(500).json({ error: 'Failed to fetch file from URL' });
      }
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'Gemini API key not set. Add it to server/.env'
      });
    }

    // Build context for AI
    let contextInstruction = `\n\n## VERIFICATION CONTEXT:\n`;
    contextInstruction += `- Expected Document Type: ${expectedDocType || 'Unknown'}\n`;
    contextInstruction += `- Reference User Name (from Google account): ${referenceUserName || 'Not provided'}\n`;
    contextInstruction += `- Reference User Email: ${referenceUserEmail || 'Not provided'}\n`;
    
    if (verifiedAadharData) {
      contextInstruction += `\n## PREVIOUSLY VERIFIED AADHAR DATA (use this for cross-checking):\n`;
      contextInstruction += `- Verified Name: ${verifiedAadharData.name || 'N/A'}\n`;
      contextInstruction += `- Father's Name: ${verifiedAadharData.fatherName || 'N/A'}\n`;
      contextInstruction += `- DOB: ${verifiedAadharData.dob || 'N/A'}\n`;
      contextInstruction += `- Aadhar Number: ${verifiedAadharData.documentNumber || 'N/A'}\n`;
    } else {
      contextInstruction += `\n## NOTE: No previously verified Aadhar data available. This may be the first document being verified. Compare name with Google profile name only.\n`;
    }

    // ---- OFFLINE TEXT EXTRACTION (Bypasses Gemini Vision Rate Limits) ----
    let extractedRawText = "";
    let usedLocalOcr = false;
    const buffer = Buffer.from(imageBase64, 'base64');
    
    console.log(`🔍 Extracting text locally for ${expectedDocType}...`);
    try {
      if (mimeType === 'application/pdf') {
        const pdfData = await pdfParse(buffer);
        extractedRawText = pdfData.text || "";
        usedLocalOcr = true;
      } else {
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(buffer);
        extractedRawText = ret.data.text || "";
        await worker.terminate();
        usedLocalOcr = true;
      }
      console.log(`✅ Local extraction complete. Text length: ${extractedRawText.length}`);
    } catch (ocrErr) {
      console.error('⚠️ Local OCR failed, falling back to AI Vision...', ocrErr.message);
      usedLocalOcr = false;
    }

    // ---- TEXT ONLY AI VERIFICATION (More robust, virtually no rate limits) ----
    let result;
    if (usedLocalOcr && extractedRawText.trim().length > 10) {
      // Fast text-only model (High Rate Limits)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" }); 
      console.log(`🤖 Using AI TEXT model logic for ${referenceUserName}...`);

      const textPrompt = `You are a strict fintech document verifier.
I have extracted the raw text from a user's uploaded document.
Your job is to read this raw text, identify the document, verify the user's details, and return strict JSON output.

${DOC_VERIFY_PROMPT}

## RAW EXTRACTED TEXT FROM USER UPLOAD:
"""
${extractedRawText}
"""
${contextInstruction}
`;
      result = await model.generateContent(textPrompt);
    } else {
      // Fallback Vision AI if local Extraction fails or returns no text
      console.log(`🤖 Using AI VISION model logic for ${referenceUserName} as fallback...`);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
      result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64
          }
        },
        { text: DOC_VERIFY_PROMPT + contextInstruction }
      ]);
    }

    const responseText = result.response.text();
    
    // Parse AI response (clean up potential markdown formatting)
    let aiResult;
    try {
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('AI response parse error:', parseErr);
      console.error('Raw AI response:', responseText);
      return res.status(500).json({ 
        error: 'AI response parsing failed',
        rawResponse: responseText
      });
    }

    console.log(`📄 Document Verification: ${expectedDocType} → ${aiResult.verified ? '✅ VERIFIED' : '❌ REJECTED'} (${aiResult.confidence}% confidence)`);

    res.json({
      success: true,
      result: aiResult
    });

  } catch (error) {
    console.error('Document Verification Error:', error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      // Extract retry delay if available
      const retryMatch = error.message?.match(/retryDelay.*?(\d+)s/);
      const waitTime = retryMatch ? retryMatch[1] : '30';
      return res.status(429).json({ 
        error: `Rate limit reached. Please wait ${waitTime} seconds and try again.`
      });
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return res.status(500).json({ 
        error: 'AI model not available. Please try again later.'
      });
    }
    
    res.status(500).json({ 
      error: 'Verification failed: ' + (error.message || 'Unknown error'),
      details: error.message
    });
  }
});

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
      model: "gemini-1.5-flash",
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
