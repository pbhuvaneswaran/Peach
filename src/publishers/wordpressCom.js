export const WORDPRESS_COM = {
  id: 'wordpress_com',
  name: 'WordPress.com',
  clientSide: false,
  validateCreds(creds) {
    return Boolean(creds?.token && creds?.siteId);
  },
  async publish({ title, html, config }) {
    const { token, siteId } = config;
    const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content: html, status: 'draft' }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`WordPress.com API returned ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return { url: data.URL };
  },
};
