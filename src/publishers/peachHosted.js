function slugify(title) {
  return (title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'article';
}

// Always-available publish target — no OAuth, no connect step. Publishing writes the
// article straight into Peach's own DB with a slug, served back out as real server-rendered
// HTML by the /blog/:handle and /blog/:handle/:slug routes in server.js (not through this
// module — those routes need direct Supabase access for slug-collision handling and listing,
// which doesn't fit the publish({title, markdown, config}) shape every other connector uses).
export const PEACH_HOSTED = {
  id: 'peach_hosted',
  name: 'Peach-hosted blog',
  clientSide: false,
  validateCreds(creds) {
    return Boolean(creds?.handle);
  },
};

export { slugify };
