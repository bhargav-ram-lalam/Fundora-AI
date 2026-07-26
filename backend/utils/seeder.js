require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const GovernmentScheme = require('../models/GovernmentScheme');
const User = require('../models/User');
const Investor = require('../models/Investor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const schemes = [
  {
    name: 'Startup India Seed Fund Scheme',
    shortName: 'SISFS',
    description: 'Provides financial assistance to startups for proof of concept, prototype development, product trials, market-entry and commercialization. The scheme provides funding of up to ₹50 lakhs through DPIIT-recognized incubators.',
    category: 'Central Government',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed'], industries: [], isRegistered: true, teamSizeMin: 1 },
    benefits: 'Up to ₹20 lakhs as grant for PoC, prototype, or product trials. Up to ₹50 lakhs as investment for market entry.',
    fundingAmount: '₹20L - ₹50L',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://seedfund.startupindia.gov.in',
    tags: ['DPIIT', 'startup india', 'seed fund', 'incubator'],
  },
  {
    name: 'Atal Innovation Mission (AIM)',
    shortName: 'AIM',
    description: "Atal Innovation Mission is NITI Aayog's flagship initiative to promote a culture of innovation and entrepreneurship in India. Provides grants and mentorship for innovative startups.",
    category: 'Central Government',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed', 'Series A'], industries: [] },
    benefits: 'Grant funding, mentorship from industry experts, access to ATL and AIC networks, co-working spaces, and investor connects.',
    fundingAmount: 'Up to ₹10Cr for incubators',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://aim.gov.in',
    tags: ['NITI Aayog', 'AIM', 'innovation', 'incubation'],
  },
  {
    name: 'MSME Technology Upgradation Scheme',
    shortName: 'MSME-TUS',
    description: 'Provides financial assistance to Micro, Small and Medium Enterprises for technology upgradation, including adoption of clean and green technology, digitization and automation.',
    category: 'MSME',
    eligibility: { stages: ['Seed', 'Series A', 'Series B', 'Growth'], industries: [], isRegistered: true },
    benefits: '15% subsidy on investment in plant & machinery (up to ₹15 lakhs), with additional subsidies for green technology and digitalization.',
    fundingAmount: 'Up to ₹15L subsidy',
    fundingType: 'Subsidy',
    isOngoing: true,
    officialLink: 'https://msme.gov.in',
    tags: ['MSME', 'technology', 'manufacturing', 'subsidy'],
  },
  {
    name: 'National AI Mission - AI Startup Grant',
    shortName: 'NAIM-Grant',
    description: "India's National AI Mission provides dedicated grants for startups building AI/ML solutions for social good, healthcare, agriculture, education and public services.",
    category: 'AI Grant',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed', 'Series A'], industries: ['AI/ML', 'HealthTech', 'EdTech', 'AgriTech'] },
    benefits: 'Grant up to ₹1 Crore, access to GPU compute credits, data sets from government, mentorship from IIT/IISc professors.',
    fundingAmount: 'Up to ₹1 Crore',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://indiaai.gov.in',
    tags: ['AI', 'ML', 'deep tech', 'national AI mission'],
  },
  {
    name: 'Women Entrepreneurship Platform (WEP)',
    shortName: 'WEP',
    description: "NITI Aayog's WEP supports women entrepreneurs through funding, skilling, and market access. Provides grants and mentorship specifically for women-led startups.",
    category: 'Women Entrepreneur',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed', 'Series A'], industries: [], womenLed: true, specificRequirements: ['At least 51% women ownership'] },
    benefits: 'Grant up to ₹30 lakhs, access to WEP network, mentorship, and market linkages with corporates.',
    fundingAmount: 'Up to ₹30L',
    fundingType: 'Mixed',
    isOngoing: true,
    officialLink: 'https://wep.gov.in',
    tags: ['women', 'entrepreneur', 'NITI Aayog', 'WEP', 'women-led'],
  },
  {
    name: 'TIDE 2.0 - Technology Incubation and Development',
    shortName: 'TIDE 2.0',
    description: "Ministry of Electronics and IT's scheme for ICT startups. Provides grants for tech startups working in IoT, AI, cybersecurity, blockchain and accessibility.",
    category: 'Central Government',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed'], industries: ['AI/ML', 'IoT', 'Cybersecurity', 'Blockchain', 'SaaS'] },
    benefits: 'Up to ₹75 lakhs in grant funding, incubation support, IP support, and access to MeitY\'s startup hub.',
    fundingAmount: 'Up to ₹75L',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://tide.meity.gov.in',
    tags: ['MeitY', 'ICT', 'IoT', 'deep tech', 'incubation'],
  },
  {
    name: 'BIRAC BIG (Biotechnology Ignition Grant)',
    shortName: 'BIRAC-BIG',
    description: 'Biotechnology Industry Research Assistance Council provides ignition grants for biotech and healthtech startups at early stage to validate proof-of-concept.',
    category: 'Central Government',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed'], industries: ['HealthTech', 'AgriTech', 'CleanTech'] },
    benefits: 'Up to ₹50 lakhs for proof of concept validation, access to BIRAC network and DBT labs.',
    fundingAmount: 'Up to ₹50L',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://birac.nic.in',
    tags: ['biotech', 'healthtech', 'BIRAC', 'DBT', 'life sciences'],
  },
  {
    name: 'Startup India Tax Exemption (80-IAC)',
    shortName: 'DPIIT-80IAC',
    description: 'DPIIT-recognized startups can apply for income tax exemption under Section 80-IAC for 3 consecutive years out of 10 years since incorporation.',
    category: 'Central Government',
    eligibility: { stages: ['Pre-Seed', 'Seed', 'Series A', 'Series B'], isRegistered: true, specificRequirements: ['DPIIT recognized', 'Incorporated after April 2016', 'Annual turnover less than 100 Crore'] },
    benefits: '100% income tax exemption for 3 consecutive years, reduced compliance burden, and DPIIT recognition certificate.',
    fundingAmount: 'Tax exemption (variable)',
    fundingType: 'Tax Benefit',
    isOngoing: true,
    officialLink: 'https://startupindia.gov.in/content/sih/en/reources/80iac.html',
    tags: ['tax exemption', 'DPIIT', '80-IAC', 'income tax'],
  },
  {
    name: 'State Government Startup Policy - Karnataka',
    shortName: 'Karnataka Startup',
    description: "Karnataka's Startup Policy 2022-27 provides grants, incubation and market access support for startups registered in Karnataka through the 'Elevate Karnataka' program.",
    category: 'State Government',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed', 'Series A'], industries: [], countries: ['India'] },
    benefits: 'Up to ₹50 lakhs seed grant, co-working space, mentorship, and access to state government procurement.',
    fundingAmount: 'Up to ₹50L',
    fundingType: 'Grant',
    isOngoing: true,
    officialLink: 'https://startup.karnataka.gov.in',
    tags: ['Karnataka', 'state government', 'Elevate', 'Bengaluru'],
  },
  {
    name: 'IIT Technology Business Incubator (TBI)',
    shortName: 'IIT-TBI',
    description: 'IIT incubators across India provide grants, mentorship, and lab access for deep tech startups founded by students, alumni and researchers from IITs.',
    category: 'University',
    eligibility: { stages: ['Idea', 'Pre-Seed', 'Seed'], industries: ['AI/ML', 'HealthTech', 'CleanTech', 'EdTech', 'IoT'], specificRequirements: ['IIT student/alumni/faculty connection preferred'] },
    benefits: 'Up to ₹25 lakhs seed grant, lab access, IP support, investor connects, and alumni network.',
    fundingAmount: 'Up to ₹25L',
    fundingType: 'Mixed',
    isOngoing: true,
    officialLink: 'https://iitbombay.org/tbi',
    tags: ['IIT', 'university', 'deep tech', 'TBI', 'research'],
  },
];

const demoInvestorUser = {
  name: 'Ravi Mehta',
  email: 'investor@fundai.demo',
  password: 'FundAI@2024',
  role: 'investor',
};

const demoInvestorProfile = {
  firmName: 'Nexus Ventures',
  investorType: 'Venture Capital',
  bio: 'Early-stage VC focused on AI, SaaS, and FinTech startups in India and Southeast Asia.',
  preferredIndustries: ['AI/ML', 'SaaS', 'FinTech', 'HealthTech', 'EdTech'],
  preferredStages: ['Seed', 'Series A', 'Pre-Seed'],
  preferredTechnologies: ['React', 'Python', 'Node.js', 'TensorFlow', 'AWS'],
  preferredCountries: ['India'],
  minInvestment: 5000000,
  maxInvestment: 200000000,
  currency: 'INR',
  successfulExits: 8,
  activeInvestments: 15,
  website: 'https://nexusventures.com',
  linkedin: 'https://linkedin.com/in/ravimehta',
  isVerified: true,
  rating: 4.8,
};

const demoAdminUser = {
  name: 'Admin FundAI',
  email: 'admin@fundai.demo',
  password: 'FundAI@2024',
  role: 'admin',
};

const seedDB = async () => {
  await connectDB();

  // Clear existing data
  await GovernmentScheme.deleteMany({});
  console.log('🗑️  Cleared existing schemes');

  // Seed schemes
  await GovernmentScheme.insertMany(schemes);
  console.log(`✅ Seeded ${schemes.length} government schemes`);

  // Create demo admin if not exists
  const existingAdmin = await User.findOne({ email: demoAdminUser.email });
  if (!existingAdmin) {
    await User.create(demoAdminUser);
    console.log('✅ Created demo admin user: admin@fundai.demo / FundAI@2024');
  }

  // Create demo investor if not exists
  let investorUser = await User.findOne({ email: demoInvestorUser.email });
  if (!investorUser) {
    investorUser = await User.create(demoInvestorUser);
    await Investor.create({ ...demoInvestorProfile, user: investorUser._id });
    console.log('✅ Created demo investor: investor@fundai.demo / FundAI@2024');
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:    admin@fundai.demo    / FundAI@2024');
  console.log('  Investor: investor@fundai.demo / FundAI@2024');
  console.log('  Founder:  Register at /register with role "founder"\n');

  process.exit(0);
};

seedDB().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
