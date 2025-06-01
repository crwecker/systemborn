import type { Book } from '~/types/book';
import { JSDOM } from 'jsdom';

const ROYALROAD_BASE_URL = 'https://www.royalroad.com';

export async function getPopularBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${ROYALROAD_BASE_URL}/fictions/best-rated`);
    const html = await response.text();
    
    // Create a DOM using jsdom
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Find all fiction entries
    const fictionElements = doc.querySelectorAll('.fiction-list-item');
    
    return Array.from(fictionElements).map(element => {
      const titleElement = element.querySelector('.fiction-title');
      const authorElement = element.querySelector('.author');
      const tagsElements = element.querySelectorAll('.tags a');
      const imageElement = element.querySelector('img');
      const descriptionElement = element.querySelector('.description');
      const statsElements = element.querySelectorAll('.stats .col-sm-6');
      
      const stats: any = {};
      statsElements.forEach(stat => {
        const label = stat.querySelector('label')?.textContent?.trim().toLowerCase();
        const value = stat.textContent?.replace(label || '', '').trim();
        if (label && value) {
          stats[label] = value;
        }
      });

      return {
        title: titleElement?.textContent?.trim() || '',
        author: {
          name: authorElement?.textContent?.trim() || ''
        },
        tags: Array.from(tagsElements).map(tag => tag.textContent?.trim() || ''),
        image: imageElement?.getAttribute('src') || '',
        description: descriptionElement?.textContent?.trim() || '',
        stats: {
          followers: parseInt(stats['followers']?.replace(/,/g, '') || '0', 10),
          pages: parseInt(stats['pages']?.replace(/,/g, '') || '0', 10),
          views: {
            total: parseInt(stats['total views']?.replace(/,/g, '') || '0', 10),
            average: 0
          },
          score: {
            total: parseFloat(stats['rating']?.split(' ')[0] || '0'),
            average: parseFloat(stats['rating']?.split(' ')[0] || '0')
          }
        }
      };
    });
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
} 