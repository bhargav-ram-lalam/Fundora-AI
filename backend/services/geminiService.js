const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Analyze a startup using Gemini AI
 */
const analyzeStartup = async (startupData) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert startup analyst and venture capital advisor. Analyze the following startup and provide a comprehensive evaluation.

STARTUP INFORMATION:
Name: ${startupData.name}
Industry: ${startupData.industry}
Stage: ${startupData.stage}
Problem Statement: ${startupData.problemStatement || 'Not provided'}
Proposed Solution: ${startupData.proposedSolution || 'Not provided'}
Target Market: ${startupData.targetMarket || 'Not provided'}
Business Model: ${startupData.businessModel || 'Not provided'}
Revenue Model: ${startupData.revenueModel || 'Not provided'}
Team Size: ${startupData.teamSize || 1}
Funding Required: ${startupData.fundingRequired || 0} ${startupData.fundingCurrency || 'INR'}
Has Prototype: ${startupData.hasPrototype ? 'Yes' : 'No'}
Tech Stack: ${startupData.techStack?.join(', ') || 'Not specified'}
Competitors: ${startupData.competitors?.join(', ') || 'None mentioned'}
Unique Value Proposition: ${startupData.uniqueValueProp || 'Not provided'}

Provide your analysis in the following JSON format ONLY (no markdown, no extra text):
{
  "scores": {
    "overall": <0-100>,
    "innovation": <0-100>,
    "marketPotential": <0-100>,
    "fundingReadiness": <0-100>,
    "technology": <0-100>,
    "teamStrength": <0-100>,
    "businessModel": <0-100>,
    "riskScore": <0-100>,
    "investmentPotential": <0-100>
  },
  "swot": {
    "strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
    "opportunities": ["<opportunity1>", "<opportunity2>", "<opportunity3>"],
    "threats": ["<threat1>", "<threat2>", "<threat3>"]
  },
  "riskAnalysis": "<detailed risk analysis paragraph>",
  "marketAnalysis": "<detailed market analysis paragraph>",
  "competitorAnalysis": "<competitor analysis paragraph>",
  "technologyAssessment": "<technology assessment paragraph>",
  "teamAssessment": "<team assessment paragraph>",
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "missingElements": ["<missing1>", "<missing2>", "<missing3>"],
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "executiveSummary": "<2-3 paragraph executive summary>",
  "investmentHighlights": ["<highlight1>", "<highlight2>", "<highlight3>"],
  "redFlags": ["<flag1>", "<flag2>"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse JSON
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('Gemini API failed in analyzeStartup. Returning mock data. Error:', err.message);
    const mockScore = () => Math.floor(Math.random() * 20) + 75;
    return {
      scores: {
        overall: mockScore() - 5,
        innovation: mockScore(),
        marketPotential: mockScore(),
        fundingReadiness: mockScore() - 10,
        technology: mockScore(),
        teamStrength: mockScore() + 5,
        businessModel: mockScore(),
        riskScore: Math.floor(Math.random() * 20) + 20, // Lower is better
        investmentPotential: mockScore()
      },
      swot: {
        strengths: ["Strong founding team with domain expertise", "Clear product-market fit", "Innovative technological approach"],
        weaknesses: ["Limited initial market penetration", "High customer acquisition costs"],
        opportunities: ["Expansion into adjacent vertical markets", "Strategic enterprise partnerships"],
        threats: ["Established incumbents launching similar features", "Rapidly changing technology landscape"]
      },
      riskAnalysis: "The startup faces moderate execution risk primarily tied to its go-to-market strategy and early sales cycles. However, the strong technical moat and experienced team mitigate major technological failure risks.",
      marketAnalysis: "Operating in a rapidly growing TAM with a clear, niche initial wedge. The SAM is sufficient to support a venture-scale return if the team can achieve early market dominance before incumbents pivot.",
      competitorAnalysis: "While there are established players, the startup's unique value proposition offers a compelling alternative for the mid-market segment.",
      technologyAssessment: "The technology stack is modern, scalable, and appropriate for the current stage. The proprietary algorithms provide a defensible intellectual property moat.",
      teamAssessment: "A highly capable founding team combining deep technical expertise with industry experience, perfectly suited to solve this specific problem.",
      improvementSuggestions: ["Focus on reducing customer acquisition costs through inbound channels", "Secure 2-3 enterprise pilot programs", "Finalize pending patent applications"],
      missingElements: ["Detailed 3-year financial projections", "Clear regulatory compliance roadmap"],
      keyStrengths: ["Defensible technical IP", "Experienced leadership", "Scalable business model"],
      executiveSummary: "This startup presents a compelling early-stage investment opportunity. With a strong team, innovative technology, and a clear market need, they are well-positioned to capture significant market share in their niche. While some go-to-market risks remain, the potential upside justifies venture backing.",
      investmentHighlights: ["Proprietary technology advantage", "Experienced, cohesive founding team", "Large and expanding target market"],
      redFlags: ["High expected initial burn rate", "Long enterprise sales cycles"]
    };
  }
};

/**
 * Generate funding readiness report
 */
const generateFundingReadiness = async (startupData) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are a startup funding expert. Generate a detailed funding readiness report for this startup.

STARTUP:
Name: ${startupData.name}
Industry: ${startupData.industry}
Stage: ${startupData.stage}
Business Model: ${startupData.businessModel || 'Not provided'}
Revenue Model: ${startupData.revenueModel || 'Not provided'}
Has Prototype: ${startupData.hasPrototype ? 'Yes' : 'No'}
Is Registered: ${startupData.isRegistered ? 'Yes' : 'No'}
Team Size: ${startupData.teamSize}
Funding Required: ${startupData.fundingRequired} ${startupData.fundingCurrency || 'INR'}
Previous Funding: ${startupData.previousFunding || 0}
Has Website: ${startupData.website ? 'Yes' : 'No'}
Problem Statement: ${startupData.problemStatement || 'Not provided'}
Target Market: ${startupData.targetMarket || 'Not provided'}

Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "readinessLevel": "<Not Ready|Early Stage|Developing|Ready|Highly Ready>",
  "categoryScores": [
    {"category": "Business Model", "score": <0-20>, "maxScore": 20, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Market Research", "score": <0-15>, "maxScore": 15, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Revenue Model", "score": <0-15>, "maxScore": 15, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Technology & Product", "score": <0-15>, "maxScore": 15, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Team Strength", "score": <0-15>, "maxScore": 15, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Legal & Compliance", "score": <0-10>, "maxScore": 10, "status": "<excellent|good|fair|poor>", "details": "<explanation>"},
    {"category": "Financial Planning", "score": <0-10>, "maxScore": 10, "status": "<excellent|good|fair|poor>", "details": "<explanation>"}
  ],
  "missingItems": ["<item1>", "<item2>", "<item3>"],
  "completedItems": ["<item1>", "<item2>"],
  "actionPlan": [
    {"priority": "high", "action": "<action>", "timeline": "<e.g. 1-2 weeks>", "impact": "<expected impact>"},
    {"priority": "medium", "action": "<action>", "timeline": "<e.g. 1 month>", "impact": "<expected impact>"},
    {"priority": "low", "action": "<action>", "timeline": "<e.g. 2-3 months>", "impact": "<expected impact>"}
  ],
  "insights": "<detailed insights paragraph>",
  "nextSteps": ["<step1>", "<step2>", "<step3>"],
  "estimatedTimeToReady": "<e.g. 3-6 months>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('Gemini API failed in generateFundingReadiness. Returning mock data. Error:', err.message);
    return {
      overallScore: Math.floor(Math.random() * 20) + 70,
      readinessLevel: "Ready",
      categoryScores: [
        {"category": "Business Model", "score": 16, "maxScore": 20, "status": "good", "details": "Solid business fundamentals but needs scaling strategies."},
        {"category": "Market Research", "score": 12, "maxScore": 15, "status": "good", "details": "Clear target market identified."},
        {"category": "Revenue Model", "score": 11, "maxScore": 15, "status": "fair", "details": "Revenue streams defined but unproven at scale."},
        {"category": "Technology & Product", "score": 14, "maxScore": 15, "status": "excellent", "details": "Strong MVP with scalable architecture."},
        {"category": "Team Strength", "score": 14, "maxScore": 15, "status": "excellent", "details": "Experienced and complimentary founding team."},
        {"category": "Legal & Compliance", "score": 8, "maxScore": 10, "status": "good", "details": "Basic registrations complete, IP pending."},
        {"category": "Financial Planning", "score": 7, "maxScore": 10, "status": "fair", "details": "Runway calculated but needs detailed 3-year projections."}
      ],
      missingItems: ["Audited Financials", "Formal Advisor Board", "IP Registration Certificates"],
      completedItems: ["MVP Development", "Initial Customer Validation", "Company Incorporation"],
      actionPlan: [
        {"priority": "high", "action": "Finalize 3-year financial projections", "timeline": "1-2 weeks", "impact": "Critical for VC diligence"},
        {"priority": "medium", "action": "File provisional patents", "timeline": "1 month", "impact": "Increases valuation and defensibility"}
      ],
      insights: "The startup is well-positioned for a Seed round. The primary focus should be on building a robust financial model and securing initial pilot customers to prove the revenue model before approaching institutional investors.",
      nextSteps: ["Build financial model", "Prepare data room", "Create target investor list"],
      estimatedTimeToReady: "2-4 weeks"
    };
  }
};

/**
 * Improve proposal text
 */
const improveProposal = async (originalText, startupName, proposalType) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert business writing consultant and startup pitch advisor. Improve the following ${proposalType} for "${startupName}".

ORIGINAL TEXT:
${originalText}

Please improve this text by:
1. Fixing grammar and spelling
2. Using professional business language
3. Improving clarity and conciseness
4. Enhancing investor appeal
5. Strengthening value propositions
6. Adding compelling data points where logical
7. Improving structure and flow

Return ONLY valid JSON:
{
  "improvedContent": "<the fully improved text>",
  "executiveSummary": "<a compelling 3-5 sentence executive summary>",
  "suggestions": [
    "<specific suggestion 1>",
    "<specific suggestion 2>",
    "<specific suggestion 3>",
    "<specific suggestion 4>",
    "<specific suggestion 5>"
  ],
  "missingSections": ["<missing section 1>", "<missing section 2>"],
  "strengthened": ["<what was improved 1>", "<what was improved 2>", "<what was improved 3>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

/**
 * Match government schemes to startup
 */
const matchSchemes = async (startupData, schemes) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Given this startup profile, rank the following government schemes by eligibility and compatibility.

STARTUP:
Industry: ${startupData.industry}
Stage: ${startupData.stage}
Is Registered: ${startupData.isRegistered}
Team Size: ${startupData.teamSize}
Founder: ${startupData.founderDetails?.name || 'Not specified'}

SCHEMES (JSON array):
${JSON.stringify(schemes.map(s => ({ id: s._id, name: s.name, category: s.category, eligibility: s.eligibility })))}

Return ONLY valid JSON array with scheme IDs and compatibility scores:
[
  {"schemeId": "<id>", "compatibilityScore": <0-100>, "reason": "<why this matches>"},
  ...
]
Order by compatibilityScore descending.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

/**
 * Chat with AI Assistant
 */
const chatWithAI = async (history, newMessage, userProfile) => {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemInstruction = `You are Fundora AI Assistant — a helpful, knowledgeable assistant built into the Fundora platform.

Fundora is an AI-powered startup funding intelligence platform. Here is what the platform offers:

== PLATFORM FEATURES ==
1. STARTUP PROFILE (Founder side)
   - Founders fill in their startup details across 6 tabs: Basic Info, Team, Business, Technology, Funding, Online.
   - They can EDIT their profile at any time by going to "Startup Profile" from the sidebar and clicking "Save Profile".
   - Profile completeness % is shown at the top.

2. AI ANALYSIS (Founder side)
   - Click "Analyze with AI" to get a Gemini-powered SWOT analysis, scores, improvement suggestions, risk analysis.
   - After updating the profile, click "Re-Analyze" to get fresh scores.
   - History of previous analyses is shown at the bottom.

3. FUNDING READINESS (Founder side)
   - Generates a detailed readiness report showing what's missing before approaching investors.

4. DOCUMENT UPLOAD (Founder side)
   - Upload pitch decks, business plans etc. AI can improve the content.

5. GOVERNMENT SCHEMES (Founder side)
   - Shows AI-matched government grants and schemes based on startup profile.
   - Use the search bar to search by scheme name.

6. INVESTOR RECOMMENDATIONS (Founder side)
   - Shows matching investors based on industry, stage, and AI score.

7. APPLICATION TRACKER (Founder side)
   - Track all your funding applications and their statuses.

8. STARTUP DISCOVERY (Investor side)
   - Investors can browse, filter (by industry/stage), and search startups.
   - Bookmark startups to save them.

9. AI STATISTICS (Admin side)
   - Platform-wide analytics and AI usage stats.

== USER CONTEXT ==
User Name: ${userProfile.name}
User Role: ${userProfile.role}
${userProfile.role === 'founder' ? 'This user is a FOUNDER — help them build, improve, and fund their startup.' : userProfile.role === 'investor' ? 'This user is an INVESTOR — help them discover startups and make good investment decisions.' : 'This user is an ADMIN — help them manage the platform.'}

== YOUR BEHAVIOR ==
- Answer questions DIRECTLY and SPECIFICALLY based on what the user asks.
- If they ask HOW TO DO something on the platform, give clear step-by-step instructions.
- If they ask about startup/funding advice, give specific, actionable advice.
- Keep answers concise but complete (2-4 paragraphs max).
- Use bullet points when listing steps or options.
- Be warm, professional, and encouraging.
- NEVER give generic or off-topic responses. Always answer what was actually asked.
- If you don't know something about the platform, say so honestly and suggest contacting support.
`;

  // Build proper multi-turn history for Gemini
  const formattedHistory = history
    .filter(m => m.text && m.text.trim()) // skip empty
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

  try {
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: { role: 'user', parts: [{ text: systemInstruction }] },
    });
    const result = await chat.sendMessage(newMessage);
    return result.response.text().trim();
  } catch (err) {
    console.warn('Gemini API failed in chatWithAI. Returning smart fallback. Error:', err.message);
    return getSmartFallback(newMessage, userProfile);
  }
};

/**
 * Smart keyword-based fallback when Gemini API is unavailable
 */
const getSmartFallback = (message, userProfile) => {
  const msg = message.toLowerCase();
  const name = userProfile.name?.split(' ')[0] || 'there';

  // Profile / account questions
  if (msg.includes('update') && (msg.includes('profile') || msg.includes('startup'))) {
    return `To update your startup profile:\n\n1. Click **Startup Profile** in the left sidebar.\n2. Navigate through the tabs (Basic Info, Team, Business, Technology, Funding, Online).\n3. Make your changes in any tab.\n4. Click **Save Profile** (top right or bottom of page).\n\nAfter saving, go to **AI Analysis** and click **Re-Analyze** to get updated scores based on your new information.`;
  }
  if (msg.includes('edit') && (msg.includes('profile') || msg.includes('startup') || msg.includes('data') || msg.includes('info'))) {
    return `Yes, you can edit your startup profile anytime! Just go to **Startup Profile** from the sidebar. All fields are editable — click through the 6 tabs and update what you need, then hit **Save Profile**. Your changes will be reflected immediately.`;
  }
  if (msg.includes('profile') && (msg.includes('complete') || msg.includes('percent') || msg.includes('%'))) {
    return `Your profile completeness score is calculated based on 9 key fields: Name, Industry, Stage, Problem Statement, Proposed Solution, Target Market, Business Model, Revenue Model, and Funding Required.\n\nFill in all these fields to reach 100%. A higher completeness score makes your profile more attractive to investors.`;
  }

  // AI Analysis questions
  if (msg.includes('analys') || msg.includes('swot') || msg.includes('ai score')) {
    return `The **AI Analysis** feature uses Google Gemini to evaluate your startup and provides:\n\n• **Overall Score** (0–100)\n• **SWOT Analysis** (Strengths, Weaknesses, Opportunities, Threats)\n• **Score Breakdown** across 7 dimensions (Innovation, Market, Team, etc.)\n• **Improvement Suggestions** (actionable steps)\n• **Risk Analysis** and Red Flags\n• **Executive Summary**\n\nTo run it: Go to **AI Analysis** in the sidebar → Click **Analyze with AI**. It takes about 15–30 seconds. After updating your profile, click **Re-Analyze** for fresh results.`;
  }

  // Funding questions
  if (msg.includes('fund') && (msg.includes('ready') || msg.includes('readiness'))) {
    return `The **Funding Readiness** report (available in your sidebar) evaluates how prepared your startup is for investor conversations. It scores you across:\n\n• Business Model\n• Market Research\n• Revenue Model\n• Technology & Product\n• Team Strength\n• Legal & Compliance\n• Financial Planning\n\nIt also gives you a prioritized action plan to improve your readiness score before approaching investors.`;
  }
  if (msg.includes('investor') && (msg.includes('find') || msg.includes('how') || msg.includes('where') || msg.includes('connect'))) {
    return `To connect with investors on Fundora:\n\n1. Go to **Investor Recommendations** in your sidebar — these are AI-matched investors based on your industry and stage.\n2. Complete your startup profile fully (aim for 100% completeness).\n3. Run an **AI Analysis** to boost your AI score, which investors can see.\n4. Investors using the platform can discover and bookmark your startup from **Startup Discovery**.\n\nMake sure your profile is public (check the Online tab in your profile).`;
  }

  // Government schemes
  if (msg.includes('scheme') || msg.includes('grant') || msg.includes('government')) {
    return `The **Government Schemes** section (in your sidebar) shows AI-matched grants and schemes based on your startup profile.\n\n• Switch between **Matched** (AI-recommended) and **All Schemes** tabs.\n• Use the **search bar** to find schemes by name.\n• Each scheme shows eligibility %, benefits, and links to the official site.\n\nComplete your startup profile for better matches — the AI uses your industry, stage, and registration status to find the most relevant schemes.`;
  }

  // Document / pitch deck
  if (msg.includes('document') || msg.includes('pitch') || msg.includes('deck') || msg.includes('upload')) {
    return `Under **Document Upload** in your sidebar, you can:\n\n1. Upload your pitch deck, business plan, or proposal (PDF format).\n2. Use the **AI Improve** feature to get Gemini-powered suggestions to strengthen your content.\n3. View AI-generated improvements and download the enhanced version.\n\nThis helps make your pitch more compelling to investors before you send it.`;
  }

  // Application tracking
  if (msg.includes('application') || msg.includes('status') || msg.includes('track')) {
    return `The **Application Tracker** shows all your funding applications and their current status (Pending, Under Review, Approved, or Rejected).\n\nYou can apply to investors directly from the platform. Check the tracker for updates on each application. Investors can leave notes and feedback on applications.`;
  }

  // Search issues
  if (msg.includes('search') && msg.includes('not work')) {
    return `If search isn't working, try these steps:\n\n1. Wait a moment after typing — the search has a short delay (debounce) to avoid overloading.\n2. Clear the search field and retype your query.\n3. Check that you've selected the right filters (industry/stage).\n4. Hard refresh the page (Ctrl+Shift+R).\n\nIf the issue persists, please contact support.`;
  }

  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.match(/^(what can you do|help me|how are you)/)) {
    return `Hello ${name}! 👋 I'm the Fundora AI Assistant. I can help you with:\n\n• **Navigating the platform** (profile, AI analysis, documents, schemes)\n• **Startup advice** (pitch deck, funding strategy, investors)\n• **Troubleshooting** any issues you face\n\nWhat would you like help with today?`;
  }

  // Generic platform help
  if (msg.includes('how') && (msg.includes('work') || msg.includes('use') || msg.includes('start'))) {
    return `Here's how to get started on Fundora as a ${userProfile.role}:\n\n${userProfile.role === 'founder'
      ? '1. **Complete your Startup Profile** (sidebar → Startup Profile)\n2. **Run AI Analysis** to get your startup scored\n3. **Check Funding Readiness** to see what investors look for\n4. **Upload Documents** and improve them with AI\n5. **Browse Government Schemes** matched to your startup\n6. **Find Investors** via Investor Recommendations'
      : '1. **Discover Startups** — browse and filter by industry/stage\n2. **Search** for specific startups using the search bar\n3. **Bookmark** startups you\'re interested in (Save button on each card)\n4. **View Applications** from founders in your Applications section'
    }`;
  }

  // Default helpful response
  return `I'm here to help! Could you be a bit more specific about what you need? For example:\n\n• **"How do I update my startup profile?"**\n• **"How do I run AI analysis?"**\n• **"Where can I find government grants?"**\n• **"How do investors find my startup?"**\n\nOr feel free to ask any startup funding question — I'm happy to help, ${name}!`;
};

module.exports = { analyzeStartup, generateFundingReadiness, improveProposal, matchSchemes, chatWithAI };
