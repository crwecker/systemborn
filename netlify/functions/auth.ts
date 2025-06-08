import { Handler } from '@netlify/functions';
import { prisma } from '../../lib/prisma';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto-js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    console.log('Auth function called:', event.path, event.httpMethod);
    
    // Remove the /.netlify/functions/auth prefix from the path
    const cleanPath = event.path.replace(/^\/.netlify\/functions\/auth\/?/, '');
    const pathSegments = cleanPath.split('/').filter(Boolean);
    const endpoint = pathSegments[0] || '';
    
    console.log('Endpoint:', endpoint);

    switch (endpoint) {
      case 'magic-link':
        return await handleMagicLink(event);
      case 'verify':
        return await handleVerify(event);
      case 'me':
        return await handleMe(event);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Error in auth function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  } finally {
    await prisma.$disconnect();
  }
};

async function handleMagicLink(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Handling magic link request');
    const { email, firstName, lastName } = JSON.parse(event.body || '{}');
    console.log('Received data:', { email, firstName, lastName });

    // Create or update user
    console.log('Creating/updating user');
    const user = await prisma.user.upsert({
      where: { email },
      update: firstName && lastName ? { firstName, lastName } : {},
      create: { 
        email, 
        firstName: firstName || '', 
        lastName: lastName || '' 
      },
    });
    console.log('User created/updated:', user.id);

    // Generate token
    const token = crypto.lib.WordArray.random(32).toString();
    console.log('Generated token');
    
    // Save magic link
    console.log('Saving magic link');
    const magicLink = await prisma.magicLink.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY),
      },
    });
    console.log('Magic link saved:', magicLink.id);

    // Only attempt to send email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('SMTP configured, attempting to send email');
      const magicLinkUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify?token=${token}`;
      
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@litrpgacademy.com',
          to: email,
          subject: 'Your Magic Link to LitRPG Academy',
          html: `
            <h1>Welcome to LitRPG Academy!</h1>
            <p>Click the button below to sign in. This link will expire in 15 minutes.</p>
            <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px;">Sign In</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${magicLinkUrl}</p>
          `,
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails, just log it
      }
    } else {
      console.log('SMTP not configured, skipping email send');
      // For development, return the token in the response
      if (process.env.NODE_ENV !== 'production') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'Magic link created (email not sent - development mode)',
            token, // Only included in development
            verifyUrl: `${process.env.APP_URL || 'http://localhost:3000'}/verify?token=${token}`
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Magic link sent successfully' 
      }),
    };
  } catch (error) {
    console.error('Error in magic-link handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to create magic link',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleVerify(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { token } = JSON.parse(event.body || '{}');

    // Find and validate magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicLink) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid magic link' 
        }),
      };
    }

    if (magicLink.expiresAt < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Magic link has expired' 
        }),
      };
    }

    if (magicLink.usedAt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Magic link has already been used' 
        }),
      };
    }

    // Mark magic link as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    // Generate JWT
    const authToken = jwt.sign(
      { userId: magicLink.user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Successfully authenticated',
        token: authToken,
        user: {
          id: magicLink.user.id,
          email: magicLink.user.email,
          firstName: magicLink.user.firstName,
          lastName: magicLink.user.lastName,
        },
      }),
    };
  } catch (error) {
    console.error('Error in verify handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to verify magic link',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleMe(event: any) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
    };
  } catch (error) {
    console.error('Error in me handler:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
} 