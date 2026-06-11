import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email service is not configured.' });
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
      return res.status(500).json({ error: 'Security check is not configured.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const {
      name = '',
      business = '',
      email = '',
      website = '',
      message = '',
      company = ''
    } = body;

    const turnstileToken =
      body['cf-turnstile-response'] ||
      body.turnstileToken ||
      '';

    if (company) {
      return res.status(200).json({ success: true });
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ error: 'Please complete your name, email and message.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ error: 'Please complete the security check.' });
    }

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: getClientIp(req)
        })
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return res.status(403).json({ error: 'Security check failed. Please try again.' });
    }

    const emailResult = await resend.emails.send({
      from: 'RS WebForged <onboarding@resend.dev>',
      to: ['rs.webforged@gmail.com'],
      replyTo: email,
      subject: `New website enquiry from ${business.trim() || name.trim()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;line-height:1.6;color:#111;">
          <h2>New RS WebForged enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Business:</strong> ${escapeHtml(business || 'Not provided')}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Website:</strong> ${escapeHtml(website || 'Not provided')}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </div>
      `,
      text: `
New RS WebForged enquiry

Name: ${name}
Business: ${business || 'Not provided'}
Email: ${email}
Website: ${website || 'Not provided'}

Message:
${message}
      `.trim()
    });

    return res.status(200).json({
      success: true,
      emailId: emailResult.data?.id || null
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
