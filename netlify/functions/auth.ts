import { Handler } from '@netlify/functions';
import { prisma } from '../../lib/prisma';
import * as jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import * as crypto from 'crypto-js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes

// Resend configuration
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Only attempt to send email if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      console.log('Resend API key configured, attempting to send email');
      const magicLinkUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify?token=${token}`;
      
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          to: [email],
          subject: 'Your Magic Link to LitRPG Academy',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2B324B; margin-bottom: 10px;">Welcome to LitRPG Academy!</h1>
                <p style="color: #666; font-size: 16px;">Your gateway to epic adventures awaits</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
                  Click the button below to sign in. This link will expire in 15 minutes.
                </p>
                
                <a href="${magicLinkUrl}" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold;
                          font-size: 16px;">
                  🔮 Enter the Academy
                </a>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>Can't click the button?</strong><br>
                  Copy and paste this link into your browser:<br>
                  <a href="${magicLinkUrl}" style="color: #856404; word-break: break-all;">${magicLinkUrl}</a>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
                <p>Happy reading! 📚⚔️</p>
                <p>The LitRPG Academy Team</p>
              </div>
            </div>
          `,
        });
        
        if (error) {
          console.error('Resend error:', error);
          // Don't fail the request if email fails, just log it
        } else {
          console.log('Email sent successfully via Resend:', data);
        }
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // Don't fail the request if email fails, just log it
      }
    } else {
      console.log('Resend API key not configured, skipping email send');
      // For development only - never expose tokens in production
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.NETLIFY === 'true' || 
                          process.env.APP_URL?.includes('.netlify.app') ||
                          process.env.APP_URL?.includes('litrpgacademy.com');
      
      if (!isProduction) {
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
      } else {
        // In production without email configured, this is an error
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Email service not configured' 
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