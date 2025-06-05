import { Handler } from '@netlify/functions';
import { fetchAvailableTags } from '../../lib/royalroad';

export const handler: Handler = async (event, context) => {
  try {
    const tags = await fetchAvailableTags();
    
    return {
      statusCode: 200,
      body: JSON.stringify(tags),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch tags' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}; 