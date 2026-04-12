export function generateWhatsAppLink(postId: string, excerpt: string): string {
  const number = process.env.WHATSAPP_NUMBER || "+260974307776";
  const truncatedExcerpt = excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt;
  const message = encodeURIComponent(
    `I saw this on Amoho (Post #${postId.substring(0, 8)}): "${truncatedExcerpt}"\n\nJoin the community: https://amoho.vercel.app/`
  );
  return `https://wa.me/${number.replace(/[^0-9+]/g, "")}?text=${message}`;
}
