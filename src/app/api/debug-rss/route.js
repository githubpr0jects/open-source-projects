import { NextResponse } from 'next/server';

// Debug endpoint to test API connectivity
export async function GET() {
  try {
    console.log('Testing API connection...');
    
    // Test the API endpoint
    const response = await fetch('https://twitter-api.opensourceprojects.dev/threads?type=github', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Open Source Projects Debug/1.0',
        'Accept': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorText: errorText,
        url: 'https://twitter-api.opensourceprojects.dev/threads?type=github'
      }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      dataCount: Array.isArray(data) ? data.length : 'Not an array',
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : data,
      url: 'https://twitter-api.opensourceprojects.dev/threads?type=github'
    });

  } catch (error) {
    console.error('Debug error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      url: 'https://twitter-api.opensourceprojects.dev/threads?type=github'
    }, { status: 500 });
  }
}
