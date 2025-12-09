import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { plaidClient } from '@/lib/plaid/client';
import { checkUser } from '@/lib/checkUser';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get request body for context (personal or company)
    const body = await request.json().catch(() => ({}));
    const context = body.context || 'PERSONAL';

    // Create Link token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id, // Use your internal user ID
      },
      client_name: 'Trackify Finance',
      products: ['transactions', 'auth'], // Request transactions and auth
      country_codes: ['US'], // Add more countries as needed
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL}/api/plaid/webhook`,
      // Optional: Add account filters
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
      },
    });

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error) {
    console.error('Error creating Plaid link token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create link token',
        message: error.response?.data?.error_message || error.message 
      },
      { status: 500 }
    );
  }
}

