import { NextResponse } from 'next/server';

// Centralized sponsors configuration - Single source of truth
const sponsors = [
  {
    id: 'droidrun',
    name: 'DroidRun',
    image: 'https://opengraph.githubassets.com/8190d792d99e38d0f692153671df84bdcc818a6797f136d88cf243807f94d0de/droidrun/droidrun',
    description: 'A powerful framework for controlling Android and iOS devices through LLM agents',
    tagline: 'Revolutionary framework that bridges the gap between Large Language Models and mobile device automation. Build intelligent testing suites and automation scripts with natural language commands.',
    link: 'https://track.opensourceprojects.dev/droidrun-sponsor',
    repo: 'droidrun/droidrun',
    startDate: '2025-07-31',
    durationDays: 30,
    tags: [
      { label: 'Mobile Testing', icon: 'fas fa-mobile-alt', color: '#ff6b35', bgColor: 'rgba(255, 107, 53, 0.1)' },
      { label: 'LLM Integration', icon: 'fas fa-robot', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)' },
      { label: 'DevOps', icon: 'fas fa-cogs', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.1)' },
      { label: 'AI/ML', icon: 'fas fa-brain', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)' }
    ]
  },
  {
    id: 'hyprnote',
    name: 'Hyprnote',
    image: 'https://opengraph.githubassets.com/1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e/hyprnote/hyprnote',
    description: 'Hyprnote: The next-gen note-taking app for developers and teams',
    tagline: 'Revolutionize your note-taking experience with AI-powered organization, code snippets, and seamless team collaboration.',
    link: 'https://track.opensourceprojects.dev/hyprnote-sponsor',
    repo: 'hyprnote/hyprnote',
    startDate: '2025-08-06',
    durationDays: 30,
    tags: [
      { label: 'Productivity', icon: 'fas fa-rocket', color: '#00b894', bgColor: 'rgba(0, 184, 148, 0.1)' },
      { label: 'Collaboration', icon: 'fas fa-users', color: '#0984e3', bgColor: 'rgba(9, 132, 227, 0.1)' },
      { label: 'AI-Powered', icon: 'fas fa-brain', color: '#6c5ce7', bgColor: 'rgba(108, 92, 231, 0.1)' },
      { label: 'Developer Tools', icon: 'fas fa-code', color: '#fd79a8', bgColor: 'rgba(253, 121, 168, 0.1)' }
    ]
  }
];

// Function to check if a sponsor is active (not expired)
const isSponsorActive = (sponsor) => {
  const now = new Date();
  const startDate = new Date(sponsor.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (sponsor.durationDays || 30));
  return now >= startDate && now <= endDate;
};

// Function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// GET /api/sponsors - Get all sponsors or active sponsors
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const shuffle = searchParams.get('shuffle') === 'true';
    const random = searchParams.get('random') === 'true';

    let filteredSponsors = activeOnly ? sponsors.filter(isSponsorActive) : sponsors;

    if (shuffle) {
      filteredSponsors = shuffleArray(filteredSponsors);
    }

    if (random && filteredSponsors.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSponsors.length);
      filteredSponsors = [filteredSponsors[randomIndex]];
    }

    return NextResponse.json({
      success: true,
      sponsors: filteredSponsors,
      total: filteredSponsors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sponsors',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/sponsors - Add a new sponsor (for future use)
export async function POST(request) {
  try {
    const newSponsor = await request.json();
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'image', 'description', 'tagline', 'link', 'repo', 'startDate'];
    for (const field of requiredFields) {
      if (!newSponsor[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Check if sponsor ID already exists
    if (sponsors.find(sponsor => sponsor.id === newSponsor.id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sponsor with this ID already exists' 
        },
        { status: 409 }
      );
    }

    // Add default values
    newSponsor.durationDays = newSponsor.durationDays || 30;
    newSponsor.tags = newSponsor.tags || [];

    // In a real application, you would save this to a database
    // For now, we'll just return success (the data won't persist)
    return NextResponse.json({
      success: true,
      message: 'Sponsor added successfully',
      sponsor: newSponsor
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add sponsor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
