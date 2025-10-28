import type { APIRoute } from 'astro';
import { Database } from '../../../lib/database';

export const GET: APIRoute = async ({ params }) => {
  try {
    const year = parseInt(params.year || '');
    if (isNaN(year)) {
      return new Response(JSON.stringify({ error: 'Invalid year' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const lottery = await Database.getLotteryByYear(year);

    if (!lottery) {
      return new Response(JSON.stringify({ error: 'Lottery not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(lottery), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch lottery' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
