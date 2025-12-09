import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const publicKey = process.env.MONO_PUBLIC_KEY;
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'MONO_PUBLIC_KEY is not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('Error getting Mono public key:', error);
    return NextResponse.json(
      { error: 'Failed to get public key' },
      { status: 500 }
    );
  }
}

