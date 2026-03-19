export const decodeHTMLEntities = (text: string) => {
  if (!text) return text;
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
};

export const getAsiaImageUrl = (url: string) => {
  if (!url) return "";

  if (!url.includes("asia-en")) {
    return url.replace(
      "https://en.onepiece-cardgame.com",
      "https://asia-en.onepiece-cardgame.com",
    );
  }

  return url;
};
