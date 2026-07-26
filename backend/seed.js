const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Startup = require('./models/Startup');
const Investor = require('./models/Investor');
const GovernmentScheme = require('./models/GovernmentScheme');
const AIAnalysis = require('./models/AIAnalysis');
const Notification = require('./models/Notification');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fundai';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('🗑️  Cleaning old collections...');
    await User.deleteMany({});
    await Startup.deleteMany({});
    await Investor.deleteMany({});
    await GovernmentScheme.deleteMany({});
    await AIAnalysis.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Users
    console.log('👤 Creating sample users (Founder, Investor, Admin)...');
    const defaultPassword = 'password123'; // Note: User model pre-save hook hashes password

    const founderUser = await User.create({
      name: 'Aarav Sharma',
      email: 'founder@fundai.com',
      password: defaultPassword,
      role: 'founder',
      phone: '+91 9876543210',
      isVerified: true
    });

    const investorUser = await User.create({
      name: 'Dr. Priya Nair (Venture Partners)',
      email: 'investor@fundai.com',
      password: defaultPassword,
      role: 'investor',
      phone: '+91 9123456789',
      isVerified: true
    });

    const adminUser = await User.create({
      name: 'Rohan Mehta',
      email: 'admin@fundai.com',
      password: defaultPassword,
      role: 'admin',
      phone: '+91 9000000000',
      isVerified: true
    });

    // 2. Create Investor Profile
    console.log('💼 Creating Investor Profile...');
    await Investor.create({
      user: investorUser._id,
      firmName: 'Nair Tech Ventures & Capital',
      investorType: 'Venture Capital',
      preferredIndustries: ['AI/ML', 'SaaS', 'HealthTech', 'FinTech', 'CleanTech'],
      preferredStages: ['Pre-Seed', 'Seed', 'Series A'],
      minInvestment: 1000000,  // 10L INR
      maxInvestment: 25000000, // 2.5 Cr INR
      preferredCountries: ['India', 'Global'],
      portfolioSize: 14,
      isVerified: true,
      bio: 'Leading seed-stage venture fund backing AI-first founders building transformational deeptech applications across emerging markets.',
      linkedin: 'https://linkedin.com/company/nair-tech-ventures'
    });

    // 3. Create Sample Startup for Founder
    console.log('🚀 Creating Sample Startup for Founder...');
    const founderStartup = await Startup.create({
      founder: founderUser._id,
      name: 'NeuralHealth AI',
      tagline: 'Autonomous precision diagnostic imaging using generative edge vision algorithms.',
      problemStatement: 'In emerging healthcare setups, over 40% of radiological diagnostic interpretations face critical clinical delays and subjective reading discrepancies due to acute physician shortages.',
      proposedSolution: 'Our lightweight deep-learning transformer architecture runs locally on imaging apparatus, performing instant abnormality segmentation and generating highly precise diagnostic reports within seconds.',
      businessModel: 'B2B SaaS with per-scan processing API pricing and annual hospital enterprise deployment licensing.',
      targetMarket: 'Diagnostic clinics, Tier-2 & Tier-3 regional hospital networks, and telehealth remote assessment providers across South and Southeast Asia.',
      marketSize: 'TAM: $12 Billion USD | SAM: $2.4 Billion USD | SOM: $150 Million USD by 2028',
      uniqueValueProp: 'Zero-cloud edge computation guarantees HIPAA/DPDP patient privacy while operating without high-bandwidth network dependency in remote rural clinics.',
      industry: 'HealthTech',
      stage: 'Seed',
      fundingRequired: 5000000, // 50L INR
      equityOffered: 8,
      isRegistered: true,
      country: 'India',
      city: 'Bengaluru',
      foundedYear: 2023,
      teamSize: 7,
      techStack: ['Python', 'PyTorch', 'TensorRT', 'React', 'FastAPI', 'AWS GreenGrass'],
      website: 'https://neuralhealth.ai',
      linkedin: 'https://linkedin.com/company/neuralhealth-ai',
      profileCompleteness: 95,
      status: 'active',
      founderDetails: {
        name: 'Aarav Sharma',
        email: 'aarav@neuralhealth.ai',
        title: 'Chief Executive & AI Architect',
        experience: 'Ex-AI Research Lead at HealthTech Labs; M.S. in Machine Learning from IISc Bangalore with 6 years deep learning applied systems experience.'
      },
      teamMembers: [
        { name: 'Dr. Sneha Verma', role: 'Chief Medical Officer', experience: '12+ years in clinical radiology and medical device validation.' },
        { name: 'Karthik Rao', role: 'VP of Engineering', experience: 'Ex-Amazon Systems Architect specializing in embedded Linux & Edge AI inference engines.' },
        { name: 'Meera Patel', role: 'Head of Growth', experience: '5 years B2B enterprise healthcare sales across Indian hospital chains.' }
      ],
      aiScore: {
        overall: 88,
        innovation: 94,
        market: 85,
        team: 91,
        technology: 90,
        business: 82,
        risk: 20,
        lastAnalyzed: new Date()
      }
    });

    // Create additional startups for investor & admin discovery
    await Startup.create([
      {
        founder: adminUser._id, // placeholder founder reference
        name: 'Agritronix India',
        tagline: 'Precision drone spraying & hyperspectral crop nutrient monitoring.',
        problemStatement: 'Overuse of chemical fertilizer causes 30% crop yield loss and soil toxicity.',
        proposedSolution: 'Autonomous AI crop spraying drones that reduce herbicide usage by 70%.',
        businessModel: 'Hardware + Agronomy Software Tier Subscription.',
        industry: 'AgriTech',
        stage: 'Series A',
        fundingRequired: 15000000,
        equityOffered: 12,
        city: 'Pune',
        country: 'India',
        foundedYear: 2022,
        teamSize: 15,
        status: 'active',
        aiScore: { overall: 84, innovation: 86, market: 89, team: 82, technology: 85, business: 80, risk: 25, lastAnalyzed: new Date() }
      },
      {
        founder: adminUser._id,
        name: 'FinSync Protocol',
        tagline: 'Automated treasury & FX risk management for cross-border SaaS exporters.',
        problemStatement: 'SaaS companies lose up to 4.5% of gross revenue on high street exchange rate volatility.',
        proposedSolution: 'Smart API layer automating invoice hedging with decentralized settlement bridges.',
        industry: 'FinTech',
        stage: 'Pre-Seed',
        fundingRequired: 2500000,
        equityOffered: 7,
        city: 'Mumbai',
        country: 'India',
        foundedYear: 2024,
        teamSize: 4,
        status: 'active',
        aiScore: { overall: 79, innovation: 83, market: 81, team: 75, technology: 80, business: 76, risk: 32, lastAnalyzed: new Date() }
      },
      {
        founder: adminUser._id,
        name: 'VedicLLM AI',
        tagline: 'Indic language sovereign legal & governance foundation model.',
        problemStatement: 'Existing frontier LLMs lack nuanced reasoning in Indian regional judicial and legislative dialects.',
        proposedSolution: 'Fine-tuned 7B and 13B specialist parameters across 14 major Indic legal repositories.',
        industry: 'AI/ML',
        stage: 'Seed',
        fundingRequired: 8000000,
        equityOffered: 10,
        city: 'Hyderabad',
        country: 'India',
        foundedYear: 2023,
        teamSize: 9,
        status: 'active',
        aiScore: { overall: 91, innovation: 96, market: 92, team: 90, technology: 94, business: 85, risk: 15, lastAnalyzed: new Date() }
      }
    ]);

    // 4. Create AI Analysis records
    console.log('🧠 Seeding historical AI Analysis records...');
    await AIAnalysis.create({
      startup: founderStartup._id,
      analyzedBy: founderUser._id,
      scores: {
        overall: 88,
        innovation: 94,
        marketPotential: 85,
        fundingReadiness: 90,
        technology: 90,
        teamStrength: 91,
        businessModel: 82,
        riskScore: 20,
        investmentPotential: 87
      },
      swot: {
        strengths: ['Zero-cloud edge computation ensures total patient privacy', 'High academic AI expertise in founding team', 'Proven compatibility with existing scanner apparatus'],
        weaknesses: ['Enterprise hospital sales cycles take 6-12 months', 'Dependence on hardware vendor integration APIs'],
        opportunities: ['Rapid expansion into Tier 2/3 diagnostic center networks across India and Southeast Asia', 'Upcoming CDSCO software device regulatory pathways'],
        threats: ['Fast-evolving open-source medical foundational models', 'Competition from large medical equipment OEMs']
      },
      executiveSummary: 'NeuralHealth AI demonstrates exceptional deeptech IP with its Edge vision inference architecture tailored for clinical radiology. Highly differentiated solution addressing genuine clinical diagnostic delays in regional hospitals.',
      improvementSuggestions: [
        'Secure multi-center retrospective study publications in Indian Journal of Radiology to solidify clinical trust.',
        'Initiate preparatory technical documentation for CDSCO Class-B Software as a Medical Device (SaMD) clearances.',
        'Partner with OEM medical machine refurbishers to pre-install edge inference software onto diagnostic machines.'
      ],
      keyStrengths: [
        'Proprietary local dataset fine-tuning without cloud transit',
        'Exceptional clinical and deep-learning founding team synergy',
        'Predictable B2B recurring subscription API revenue model'
      ],
      status: 'completed',
      modelUsed: 'gemini-1.5-pro'
    });

    // 5. Create Government Schemes
    console.log('🏛️  Seeding Indian & Global Government Schemes...');
    await GovernmentScheme.create([
      {
        name: 'IndiaAI Mission Startup Grant & Compute Capacity Support',
        shortName: 'IndiaAI Mission Grant',
        category: 'AI Grant',
        description: 'Under the ₹10,372 crore IndiaAI Mission, high-potential deeptech AI startups obtain direct capital subsidies, cloud GPU compute voucher allocations, and mentorship for indigenous foundational solutions.',
        benefits: 'Up to ₹50 Lakhs direct grant + subsidized access to National AI Compute infrastructure (NVIDIA H100/A100 clusters) + integration with public digital platforms.',
        eligibility: {
          industries: ['AI/ML', 'HealthTech', 'AgriTech', 'FinTech', 'SaaS'],
          stages: ['Idea', 'Pre-Seed', 'Seed', 'Series A'],
          teamSizeMin: 2,
          isRegistered: true,
          specificRequirements: ['Must be recognized by DPIIT India', 'Core technology must incorporate artificial intelligence architectures']
        },
        deadline: new Date('2026-11-30'),
        officialLink: 'https://indiaai.gov.in',
        fundingAmount: 'Up to ₹50 Lakhs + Compute Vouchers',
        fundingType: 'Grant',
        isOngoing: true,
        isActive: true
      },
      {
        name: 'Startup India Seed Fund Scheme (SISFS)',
        shortName: 'SISFS Grant & Debt',
        category: 'Central Government',
        description: 'Financial assistance to early-stage Indian startups for proof of concept, prototype development, product trials, market entry, and commercialization through approved incubators.',
        benefits: 'Up to ₹20 Lakhs grant for validation/prototype development + Up to ₹50 Lakhs investment through convertible debentures or debt for market entry.',
        eligibility: {
          industries: ['AI/ML', 'HealthTech', 'FinTech', 'AgriTech', 'CleanTech', 'EdTech', 'SaaS', 'IoT', 'Blockchain', 'Other'],
          stages: ['Idea', 'Pre-Seed', 'Seed'],
          teamSizeMin: 1,
          isRegistered: true,
          specificRequirements: ['Incorporated not more than 2 years ago', 'Must not have received more than ₹10 Lakhs monetary support from any other central/state government scheme']
        },
        deadline: new Date('2026-12-31'),
        officialLink: 'https://seedfund.startupindia.gov.in',
        fundingAmount: '₹20L Grant / ₹50L Debt',
        fundingType: 'Mixed',
        isOngoing: true,
        isActive: true
      },
      {
        name: 'BIRAC BIG (Biotechnology Ignition Grant) - Health & MedTech',
        shortName: 'BIRAC BIG MedTech Grant',
        category: 'Central Government',
        description: 'Flagship early-stage ignition grant program by Department of Biotechnology (DBT), Government of India, supporting revolutionary biomedical, medical device, and healthcare algorithms.',
        benefits: 'Grant-in-aid up to ₹50 Lakhs over an 18-month duration with comprehensive technical incubator hosting and regulatory guidance.',
        eligibility: {
          industries: ['HealthTech', 'AI/ML'],
          stages: ['Idea', 'Pre-Seed', 'Seed'],
          teamSizeMin: 2,
          isRegistered: true,
          specificRequirements: ['Company should be incorporated under Indian Companies Act 2013 and less than 5 years old', '51% of equity must be owned by Indian Citizens']
        },
        deadline: new Date('2026-08-15'),
        officialLink: 'https://birac.nic.in/big.php',
        fundingAmount: 'Up to ₹50 Lakhs Grant-in-Aid',
        fundingType: 'Grant',
        isOngoing: false,
        isActive: true
      },
      {
        name: 'MeitY TIDE 2.0 (Technology Incubation and Development of Entrepreneurs)',
        shortName: 'MeitY TIDE 2.0',
        category: 'Central Government',
        description: 'Promoting technology entrepreneurship across emerging technologies such as Artificial Intelligence, Blockchain, IoT, Robotics, and Analytics across societal priority domains.',
        benefits: 'EiR (Entrepreneur-in-Residence) grant up to ₹4 Lakhs + Startup Grant up to ₹7 Lakhs + scale-up facilitation across national academic institutions.',
        eligibility: {
          industries: ['AI/ML', 'IoT', 'Blockchain', 'SaaS', 'HealthTech'],
          stages: ['Idea', 'Pre-Seed'],
          teamSizeMin: 1,
          isRegistered: false,
          specificRequirements: ['Solution should leverage deep tech / ICT towards addressing societal problems in healthcare, education, agriculture, or clean energy']
        },
        officialLink: 'https://meity.gov.in/content/tide-20',
        fundingAmount: '₹4L to ₹7L Grant',
        fundingType: 'Grant',
        isOngoing: true,
        isActive: true
      },
      {
        name: 'Karnataka Elevation Superstars Grant (ELEVATE)',
        shortName: 'ELEVATE Karnataka',
        category: 'State Government',
        description: 'Comprehensive grant and acceleration initiative by the Government of Karnataka assisting early-stage innovative startups registered across the state.',
        benefits: 'One-time non-dilutive innovation grant up to ₹50 Lakhs, legal & financial advisory, and incubation seat access in Bengaluru & regional technology centers.',
        eligibility: {
          industries: ['AI/ML', 'HealthTech', 'SaaS', 'CleanTech', 'EdTech', 'FinTech'],
          stages: ['Pre-Seed', 'Seed'],
          teamSizeMin: 2,
          isRegistered: true,
          specificRequirements: ['Entity must be incorporated in Karnataka or operating primary headquarters in Karnataka', 'DPIIT registration mandatory']
        },
        deadline: new Date('2026-10-01'),
        officialLink: 'https://startup.karnataka.gov.in',
        fundingAmount: 'Up to ₹50 Lakhs Grant',
        fundingType: 'Grant',
        isOngoing: false,
        isActive: true
      },
      {
        name: 'Google for Startups Accelerator: AI First (India)',
        shortName: 'Google AI First Accelerator',
        category: 'AI Grant',
        description: '3-month equity-free acceleration program giving AI startups access to advanced Google Cloud credits, custom Gemini AI engineering mentorship, and investor network introductions.',
        benefits: 'Up to $350,000 USD in Google Cloud & AI Studio credits + dedicated AI engineering architects + go-to-market advisory + alumni equity-free network.',
        eligibility: {
          industries: ['AI/ML', 'HealthTech', 'SaaS', 'FinTech', 'AgriTech'],
          stages: ['Seed', 'Series A'],
          teamSizeMin: 3,
          isRegistered: true,
          specificRequirements: ['Must have a working AI-first prototype or scaling product with demonstrated initial user traction']
        },
        officialLink: 'https://startup.google.com/programs/accelerator/india/',
        fundingAmount: '$350,000 in Cloud Credits',
        fundingType: 'Mentorship',
        isOngoing: true,
        isActive: true
      }
    ]);

    // 6. Create Initial Notifications
    console.log('🔔 Creating sample system notifications...');
    await Notification.create([
      {
        recipient: founderUser._id,
        title: '🤖 AI Analysis Evaluation Completed!',
        message: 'Your startup profile NeuralHealth AI scored an impressive 88/100 on our 5-vector Gemini evaluation model. View your diagnostic report and recommendations.',
        type: 'ai_analysis_complete',
        isRead: false
      },
      {
        recipient: founderUser._id,
        title: '🏦 New VC Profile Match Found',
        message: 'Nair Tech Ventures & Capital matches 95% with your Stage (Seed) and Industry (HealthTech) funding requirements. Submit your application today!',
        type: 'new_investor_match',
        isRead: false
      },
      {
        recipient: founderUser._id,
        title: '🏛️ Eligible Government Scheme Detected',
        message: 'You qualify for the IndiaAI Mission Startup Grant with up to ₹50 Lakhs non-dilutive capital support.',
        type: 'new_scheme',
        isRead: true
      },
      {
        recipient: investorUser._id,
        title: '🌟 High AI-Score Startup Alert',
        message: 'VedicLLM AI just scored 91/100 on platform evaluation. Review their profile in your discovery portal.',
        type: 'new_investor_match',
        isRead: false
      }
    ]);

    console.log('✨ Database seeding completed successfully! ✨\n');
    console.log('====================================================');
    console.log('  TEST CREDENTIALS (All passwords: password123)     ');
    console.log('====================================================');
    console.log('  1. Founder:  founder@fundai.com');
    console.log('  2. Investor: investor@fundai.com');
    console.log('  3. Admin:    admin@fundai.com');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
