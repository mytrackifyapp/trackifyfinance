import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBankProvider } from '@/lib/bank-providers/provider-factory';
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

    const body = await request.json().catch(() => ({}));
    const context = body.context || 'PERSONAL';

    const provider = getBankProvider('MONO');
    const linkTokenData = await provider.createLinkToken(user.id, context);

    return NextResponse.json({
      link_token: linkTokenData.link_token || linkTokenData.mono_code,
      expiration: linkTokenData.expiration?.toISOString(),
      mono_code: linkTokenData.mono_code, // Mono-specific
      isSandbox: linkTokenData.isSandbox || false,
      widgetUrl: linkTokenData.widgetUrl, // Widget URL with public key
      publicKey: linkTokenData.publicKey, // Public key for widget
    });
  } catch (error) {
    console.error('Error creating Mono link token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create link token',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

