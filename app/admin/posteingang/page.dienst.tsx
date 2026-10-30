import { getMessages } from '@/lib/store';
import Posteingang from './Posteingang';

export const dynamic = 'force-dynamic';

export default async function PosteingangPage() {
  const messages = await getMessages();
  return <Posteingang messages={messages} />;
}
