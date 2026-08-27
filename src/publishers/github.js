export const GITHUB = {
  id: 'github',
  name: 'GitHub',
  clientSide: false,
  validateCreds(creds) {
    return Boolean(creds?.token && creds?.owner && creds?.repo);
  },
  async publish({ title, markdown, config }) {
    const { token, owner, repo, branch = 'main', pathPrefix = 'content', format = 'md' } = config;
    const slug = (title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const path = `${(pathPrefix || 'content').replace(/^\/|\/$/g, '')}/${slug}.${format}`;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add article: ${title}`,
        content: Buffer.from(markdown || '').toString('base64'),
        branch,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`GitHub API returned ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return { url: data.content?.html_url || `https://github.com/${owner}/${repo}/blob/${branch}/${path}` };
  },
};
