const BASE_URL = "https://animebook.io";

function generateSiteMap(users, posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${BASE_URL}</loc><priority>1.0</priority></url>
      <url><loc>${BASE_URL}/explore</loc><priority>0.8</priority></url>
      <url><loc>${BASE_URL}/live</loc><priority>0.8</priority></url>
      ${users.map(u => `<url><loc>${BASE_URL}/profile/${u.username}</loc><lastmod>${u.updated_at}</lastmod><priority>0.7</priority></url>`).join("")}
      ${posts.map(p => `<url><loc>${BASE_URL}/exploreid/${p.id}</loc><lastmod>${p.created_at}</lastmod><priority>0.5</priority></url>`).join("")}
    </urlset>`;
}

export async function getServerSideProps({ res }) {
  const { data: users } = await supabase.from("users").select("username, updated_at");
  const { data: posts } = await supabase.from("posts").select("id, created_at");

  const sitemap = generateSiteMap(users, posts);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function SiteMap() {}