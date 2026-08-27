import { WORDPRESS } from './base.js';
import { GITHUB } from './github.js';
import { WORDPRESS_COM } from './wordpressCom.js';

// Add new connectors here as they're built (Webflow, Notion, Contentful, HubSpot, etc.)
const PUBLISHERS = {
  wordpress: WORDPRESS,
  wordpress_com: WORDPRESS_COM,
  github: GITHUB,
};

function getPublisher(type) {
  return PUBLISHERS[type] || null;
}

function listPublishers() {
  return Object.values(PUBLISHERS);
}

export { PUBLISHERS, getPublisher, listPublishers };
