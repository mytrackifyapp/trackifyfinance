import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Mono widget URL - this is typically handled client-side
    // For now, return the Mono connect URL
    const monoBaseUrl = process.env.MONO_API_URL || 'https://api.withmono.com';
    const widgetUrl = `${monoBaseUrl}/v1/account/auth?code=${code}`;

    return NextResponse.json({
      widget_url: widgetUrl,
    });
  } catch (error) {
    console.error('Error getting Mono widget URL:', error);
    return NextResponse.json(
      { error: 'Failed to get widget URL' },
      { status: 500 }
    );
  }
}

