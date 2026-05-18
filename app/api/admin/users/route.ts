import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.MARZBAN_API_URL;
    const username = process.env.MARZBAN_USERNAME;
    const password = process.env.MARZBAN_PASSWORD;

    if (!apiUrl || !username || !password) return NextResponse.json({ error: 'Missing .env credentials' }, { status: 500 });

    const tokenRes = await fetch(`${apiUrl}/api/admin/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: new URLSearchParams({ username, password, grant_type: 'password' }),
      cache: 'no-store'
    });
    
    if (!tokenRes.ok) return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
    const token = (await tokenRes.json()).access_token;

    const usersRes = await fetch(`${apiUrl}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!usersRes.ok) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });

    const usersData = await usersRes.json();
    return NextResponse.json({ success: true, users: usersData });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
