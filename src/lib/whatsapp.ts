export function generateWhatsAppLink(postId: string, excerpt: string): string {
  const truncatedExcerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt;
  const message = encodeURIComponent(
    `I saw this on Amoho (Post #${postId.substring(0, 8)}): "${truncatedExcerpt}"\n\nJoin the community: https://amoho.vercel.app/`
  );
  return `https://api.whatsapp.com/send?text=${message}`;
}
