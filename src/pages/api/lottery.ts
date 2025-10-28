import type { APIRoute } from 'astro';
import { Database } from '../../lib/database';

export const GET: APIRoute = async () => {
  try {
    const lotteries = await Database.getAllLotteries();
    return new Response(JSON.stringify(lotteries), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch lotteries' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const lottery = await request.json();
    await Database.saveLottery(lottery);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save lottery' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
