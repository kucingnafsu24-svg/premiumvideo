const ICONS = {
  "discord.gg": "/icons/discord.svg",
  "discord.com": "/icons/discord.svg",
  "twitter.com": "/icons/x.svg",
  "x.com": "/icons/x.svg",
  "tiktok.com": "/icons/tiktok.svg",
  "instagram.com": "/icons/instagram.svg",
  "youtube.com": "/icons/youtube.svg",
  "youtu.be": "/icons/youtube.svg",
};

function getIcon(url) {
  try {
    const host = new URL(url.replace(/&amp;/g, "&")).hostname.replace(/^www\./, "");
    return ICONS[host] || null;
  } catch {
    return null;
  }
}

function anchor(url, label) {
  const icon = getIcon(url);
  const img = icon ? `<img class="desc-icon" src="${icon}" alt="" width="16" height="16">` : "";
  return `${img}<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

export function linkify(text = "") {
  // 1. escape HTML supaya aman
  let out = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. [label](url) -> link dengan label custom + ikon
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, label, url) => anchor(url, label)
  );

  // 3. URL polos yang belum jadi link
  out = out.replace(
    /(?<!["'>])(https?:\/\/[^\s<]+)/g,
    (_, url) => anchor(url, url)
  );

  // 4. hashtag -> link hashtag YouTube
  out = out.replace(
    /(^|\s)#([\p{L}\p{N}_]+)/gu,
    '$1<a href="https://www.youtube.com/hashtag/$2" target="_blank" rel="noopener noreferrer">#$2</a>'
  );

  return out;
}
