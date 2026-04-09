import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "edufinanceai"
  });
}

const db = admin.firestore();

async function checkAndSeed() {
  try {
    console.log("Checking database...");

    // 1. Check Loans
    console.log("Checking 'loans' collection...");
    const loansSnap = await db.collection('loans').limit(1).get();
    if (loansSnap.empty) {
      console.log("Loans collection is empty. Seeding default loan...");
      await db.collection('loans').doc('LOAN-OFFER-001').set({
        title: 'SBI Scholar Loan Scheme',
        interestRate: "8.55% - 13.75%",
        interestRateValue: 8.55,
        maxAmount: "₹20,00,000",
        maxAmountValue: 2000000,
        tenure: "5 - 15 years",
        approvalConfidence: 96,
        aiTag: "Best for Edu",
        loanId: "LOAN-OFFER-001",
        bankName: "State Bank of India",
        loanType: "Education Loan",
        loanName: "SBI Scholar Loan Scheme",
        maxLoanAmount: 2000000,
        minLoanAmount: 50000,
        processingFee: "0 - 1%",
        loanTenure: "5 - 15 years",
        moratoriumPeriod: "Course Duration + 6 months",
        features: ["No collateral up to ₹7.5 Lakhs", "1% concession for female students", "Quick approval online"],
        eligibility: {
          nationality: "Indian",
          age: "18-35 years",
          academicRequirement: "Secured admission to a recognized institute",
          admission: "Entrance exam or merit-based"
        },
        requiredDocuments: ["Aadhar/PAN", "Admission Letter", "Mark sheets", "Income proof of co-borrower"],
        repaymentDetails: {
          emiStart: "After moratorium period ends",
          prepaymentCharges: "Nil",
          emiExample: "₹20,500/month for ₹20L at 8.85% for 12 years"
        },
        status: "Available",
        rating: 4.5,
        applyLink: "/apply-loan/sbi",
        createdAt: new Date().toISOString()
      });
      console.log("✅ Loan seeded.");
    } else {
      console.log("✅ Loans collection already has data.");
    }

    // 2. Check Government Aid
    console.log("Checking 'governmentSchemes' collection...");
    const govSnap = await db.collection('governmentSchemes').limit(1).get();
    if (govSnap.empty) {
      console.log("governmentSchemes collection is empty. Seeding default schemes...");
      const DEFAULT_SCHEMES = [
        {
          schemeId: 'GOV-PM-SCHOLARSHIP',
          name: 'PM Scholarship Scheme (PMSS)',
          ministry: 'Ministry of Education',
          category: 'Central Government',
          amount: '₹25,000 - ₹36,200',
          amountValue: 36200,
          deadline: '31 Oct 2025',
          eligibility: ['Ex-servicemen / Para-military children', 'Min 60% in 12th', 'Under 25 years'],
          benefits: ['Annual scholarship', 'Technical / Professional courses', 'Direct bank transfer'],
          tags: ['Central', 'Merit', 'Ex-Servicemen'],
          match: 92,
          status: 'Active',
          applyLink: 'https://scholarships.gov.in',
          color: 'from-orange-500 to-red-600',
          initials: 'PM',
          featured: true,
          totalSeats: 5500,
          documentsRequired: ['Aadhaar Card', 'Income Certificate', '12th Marksheet', 'ESM PPO Copy'],
        },
        {
          schemeId: 'GOV-NSP-OBC',
          name: 'Post Matric Scholarship for OBC',
          ministry: 'Ministry of Social Justice',
          category: 'OBC Welfare',
          amount: '₹1,200 - ₹2,400/month',
          amountValue: 28800,
          deadline: '15 Nov 2025',
          eligibility: ['OBC Category students', 'Post-matriculation study', 'Family income < ₹1 Lakh/year'],
          benefits: ['Monthly stipend', 'Book allowance', 'Study tour charges'],
          tags: ['OBC', 'Post-Matric', 'Stipend'],
          match: 87,
          status: 'Active',
          applyLink: 'https://scholarships.gov.in',
          color: 'from-blue-500 to-indigo-600',
          initials: 'OBC',
          featured: false,
          totalSeats: 0,
          documentsRequired: ['Caste Certificate', 'Income Certificate', 'Last Marksheet', 'Aadhaar'],
        },
        {
          schemeId: 'GOV-NSP-SC',
          name: 'Post Matric Scholarship for SC/ST',
          ministry: 'Ministry of Tribal Affairs',
          category: 'SC/ST Welfare',
          amount: '₹2,000 - ₹5,800/month',
          amountValue: 69600,
          deadline: '30 Nov 2025',
          eligibility: ['SC/ST Category', 'Post-Matriculation courses', 'No income ceiling'],
          benefits: ['Full tuition fee reimbursement', 'Monthly maintenance', 'Study material allowance'],
          tags: ['SC/ST', 'Post-Matric', 'Full Coverage'],
          match: 94,
          status: 'Active',
          applyLink: 'https://scholarships.gov.in',
          color: 'from-purple-500 to-pink-600',
          initials: 'ST',
          featured: true,
          totalSeats: 0,
          documentsRequired: ['SC/ST Certificate', 'Income Certificate', 'Marksheets', 'Aadhaar'],
        }
      ];

      for (const scheme of DEFAULT_SCHEMES) {
        await db.collection('governmentSchemes').doc(scheme.schemeId).set({
          ...scheme,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log("✅ Government schemes seeded.");
    } else {
      console.log("✅ governmentSchemes collection already has data.");
    }
  } catch (error) {
    console.error("❌ Error during check/seed:", error);
    process.exit(1);
  }
}


checkAndSeed().catch(console.error);
