import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Environment variables for email configuration
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || EMAIL_USER;

// Validate required environment variables
if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
  console.error('Missing email configuration environment variables');
}

// Limits keep a single submission from becoming an unbounded header or body.
const MAX_NAME = 120;
const MAX_SUBJECT = 150;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

/**
 * A bare CR or LF inside a header value terminates that header, letting the
 * rest of the input be read as additional headers (Bcc, Reply-To, ...). Strip
 * line breaks and other control characters before any value reaches nodemailer.
 */
function sanitizeHeader(value: string, max: number): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);
}

/** Submitted text is interpolated into HTML email bodies, so escape it. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // A non-string field would slip past the checks below and reach nodemailer.
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json(
        { error: 'All fields must be text' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Header-safe values for anything that lands in a header, plus escaped
    // copies for the HTML bodies. Everything below uses these, never the raw input.
    const safeName = sanitizeHeader(name, MAX_NAME);
    const safeSubject = sanitizeHeader(subject, MAX_SUBJECT);
    const safeEmail = sanitizeHeader(email, MAX_EMAIL);
    const safeMessage = message.slice(0, MAX_MESSAGE);

    if (!safeName || !safeSubject) {
      return NextResponse.json(
        { error: 'Name and subject must contain visible characters' },
        { status: 400 }
      );
    }

    const htmlName = escapeHtml(safeName);
    const htmlSubject = escapeHtml(safeSubject);
    const htmlEmail = escapeHtml(safeEmail);
    const htmlMessage = escapeHtml(safeMessage);

    // Check if email configuration is available
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      // Fallback: log the message for development
      console.log('Email would be sent with following details:', {
        to: CONTACT_EMAIL,
        from: EMAIL_USER,
        subject: `Contact Form: ${safeSubject}`,
        text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${htmlName}</p>
          <p><strong>Email:</strong> ${htmlEmail}</p>
          <p><strong>Subject:</strong> ${htmlSubject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${htmlMessage.replace(/\n/g, '<br>')}</p>
        `
      });

      return NextResponse.json(
        { 
          message: 'Message received successfully! (Email logging mode - configure email settings for actual delivery)',
          logged: true
        },
        { status: 200 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Email content
    const mailOptions = {
      from: EMAIL_USER,
      to: CONTACT_EMAIL,
      subject: `Contact Form: ${safeSubject}`,
      replyTo: safeEmail,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${htmlName}</p>
            <p><strong>Email:</strong> <a href="mailto:${htmlEmail}">${htmlEmail}</a></p>
            <p><strong>Subject:</strong> ${htmlSubject}</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #666;">${htmlMessage}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            This message was sent from the photographer portfolio contact form.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to the sender (optional)
    const confirmationOptions = {
      from: EMAIL_USER,
      to: safeEmail,
      subject: 'Thank you for your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out!</h2>
          <p>Hi ${htmlName},</p>
          <p>I've received your message regarding "${htmlSubject}" and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message for your records:</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="white-space: pre-wrap; color: #666;">${htmlMessage}</p>
          </div>
          <p>Best regards,<br>Photographer</p>
        </div>
      `,
    };

    // Send confirmation email (don't fail if this doesn't work)
    try {
      await transporter.sendMail(confirmationOptions);
    } catch (confirmError) {
      console.warn('Failed to send confirmation email:', confirmError);
    }

    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
