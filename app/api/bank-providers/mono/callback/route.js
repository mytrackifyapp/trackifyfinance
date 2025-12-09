import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Mono callback handler - redirects to exchange code after user connects
 */
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const context = searchParams.get('context') || 'PERSONAL';

  if (!code) {
    // Redirect to accounting page with error
    return redirect('/dashboard/accounting?error=mono_connection_failed');
  }

  // Redirect to exchange code endpoint
  return redirect(`/dashboard/accounting?mono_code=${code}&context=${context}&provider=mono`);
}

