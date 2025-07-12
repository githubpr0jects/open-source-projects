export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ message: 'Brevo API key not configured.' }), { status: 500 });
  }

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        // You might need to add other attributes here based on your Brevo setup
        // e.g., listIds: [YOUR_LIST_ID]
      }),
    });

    if (brevoResponse.ok) {
      return new Response(JSON.stringify({ message: 'Subscription successful!' }), { status: 200 });
    } else {
      const errorData = await brevoResponse.json();
      console.error('Brevo API error:', errorData);
      return new Response(JSON.stringify({ message: errorData.message || 'Failed to subscribe via Brevo.' }), { status: brevoResponse.status });
    }
  } catch (error) {
    console.error('Error sending to Brevo:', error);
    return new Response(JSON.stringify({ message: 'Failed to connect to Brevo API.' }), { status: 500 });
  }
}