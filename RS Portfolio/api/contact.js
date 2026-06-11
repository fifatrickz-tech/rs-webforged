import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
  name,
  business,
  email,
  website,
  message
} = req.body;

const turnstileToken =
  req.body['cf-turnstile-response'] ||
  req.body.turnstileToken;
  
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Validate Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({
        error: 'Turnstile token missing'
      });
    }

    // Verify Turnstile with Cloudflare
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return res.status(403).json({
        error: 'Turnstile verification failed'
      });
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: 'RS WebForged <onboarding@resend.dev>',
      to: ['rs.webforged@gmail.com'],
      replyTo: email,
      subject: `New Website Enquiry From ${business || name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;">
          <h2>New RS WebForged Enquiry</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>

          <p><strong>Business:</strong> ${escapeHtml(
            business || 'Not provided'
          )}</p>

          <p><strong>Email:</strong> ${escapeHtml(email)}</p>

          <p><strong>Website:</strong> ${escapeHtml(
            website || 'Not provided'
          )}</p>

          <hr>

          <p><strong>Message:</strong></p>

          <p>
            ${escapeHtml(message).replace(/\n/g, '<br>')}
          </p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      emailId: emailResult.data?.id
    });
  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      error: 'Server error'
    });
  }
}

// Prevent HTML injection in email content
function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}