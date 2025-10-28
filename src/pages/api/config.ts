import type { APIRoute } from 'astro';
import { Database } from '../../lib/database';

export const GET: APIRoute = async () => {
  try {
    const config = await Database.getConfig();
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch config' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const config = await request.json();
    await Database.updateConfig(config);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update config' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
