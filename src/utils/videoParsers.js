export const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getTikTokId = (url) => {
  if (!url) return null;
  // Handle standard tiktok URLs
  const regExp = /tiktok\.com\/(?:@[\w.-]+\/video\/(\d+)|v\/(\d+))/i;
  const match = url.match(regExp);
  return match ? (match[1] || match[2]) : null;
};

export const isDirectVideo = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return /\.(mp4|webm|ogg|mov)$/i.test(urlObj.pathname);
  } catch (e) {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }
};
