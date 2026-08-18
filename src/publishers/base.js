/**
 * Publish-target adapter contract. Every connector in registry.js should conform to this shape:
 *
 * {
 *   id: string,            // e.g. 'wordpress'
 *   name: string,          // display name, e.g. 'WordPress'
 *   clientSide: boolean,   // true if publishing happens directly from the browser (no server round-trip
 *                          // needed — e.g. WordPress Application Passwords). false for connectors that
 *                          // require server-held OAuth tokens (Webflow, Notion, etc. — not built yet).
 *   validateCreds(creds): boolean,
 * }
 *
 * Client-side connectors (clientSide: true) implement their own publish() in the frontend
 * (see ArticleExportBar.jsx for the WordPress implementation) and then call
 * POST /api/articles/:id/publish to record the result server-side.
 *
 * Server-side connectors (clientSide: false) would implement publish({title, html, markdown, creds, config})
 * here and be invoked from a new server route — none exist yet.
 */

export const WORDPRESS = {
  id: 'wordpress',
  name: 'WordPress',
  clientSide: true,
  validateCreds(creds) {
    return Boolean(creds?.url && creds?.password);
  },
};
