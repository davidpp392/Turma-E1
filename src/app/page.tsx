import { getServerUser } from '@/lib/supabase/server-data';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getServerUser();
  redirect(user ? '/dashboard' : '/login');
}
