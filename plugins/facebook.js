/*
Facebook Downloader
Scrape Source: https://whatsapp.com/channel/0029VbBJKfE0gcfCAJZEVh3R/125
*/
import axios from "axios";

// ===== معلومات القناة =====
const channelName = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧 🇲🇦'
const CHANNEL_ID = '120363410733859643@newsletter'
const INSTAGRAM_URL = `https://instagram.com/mysto__off`
const DEVELOPER = '*𝗕𝗬 𝗠𝗬𝗦𝗧𝗢 𝗢𝗙𝗙*'
const newsletter = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: CHANNEL_ID,
        newsletterName: channelName
    }
}
// =====================================

async function getToken() {
  const url = "https://fbdownloader.to/id";
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const regex = /k_exp="(.*?)".*?k_token="(.*?)"/s;
  const match = html.match(regex);
  if (!match) throw new Error("Token not found");

  return {
    k_exp: match[1],
    k_token: match[2]
  };
}

async function fbDownloader(fbUrl) {
  const { k_exp, k_token } = await getToken();

  const payload = new URLSearchParams({
    k_exp,
    k_token,
    p: "home",
    q: fbUrl,
    lang: "id",
    v: "v2",
    W: ""
  });

  const { data } = await axios.post(
    "https://fbdownloader.to/api/ajaxSearch",
    payload,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://fbdownloader.to",
        "Referer": "https://fbdownloader.to/id"
      }
    }
  );

  if (!data ||!data.data) throw new Error("Failed to retrieve video data");

  const html = data.data;
  const results = [];

  const rowRegex =
    /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g;

  let match;
  while ((match = rowRegex.exec(html))!== null) {
    const quality = match[1].trim();
    const url = match[2] || match[3];
    if (quality && url) results.push({ quality, url });
  }

  return results;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.sendMessage(m.chat, {
      text: `*📥 تـحـميـل فـيـديـوهـات فيـسبـوك*\n\n📌 *الامـر:* \`${usedPrefix + command} لـيـنـك\`\n💡 *مـثـال:* \`${usedPrefix + command} https://facebook.com/watch?v=xxx\``,
      contextInfo: newsletter
    }, { quoted: m })

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  await conn.sendMessage(m.chat, { text: `*⏱️ انتــظــر ثــوانــــي*\n\n🔍 يـتـم جـلـب الـمـيـديـا... ⏳`, contextInfo: newsletter }, { quoted: m })

  try {
    const results = await fbDownloader(text);

    if (!results.length)
      throw new Error("مـا تـلـقـاش الـفـيـديـو");

    const videoUrl = results[0].url;
    const quality = results[0].quality

    const { data: buffer } = await axios.get(videoUrl, {
      responseType: "arraybuffer"
    });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // نفس الكابتشن ديال ig
    let caption = `*📥 تـم تـحمـيل بـنـجـاح*

*📀 الـعـنـوان :* Facebook Video
*👤 مـطـور :* ${DEVELOPER}
*🔗 الـرابـط :* ${text}
*🎞️ الـجـودة :* ${quality}`

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        caption: caption,
        footer: `❀ بـواسـطـة ${channelName} ❀`,
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📷 اضـغـطـونـا لـمـتـابـعـة الـحـسـاب ديـالـي',
              url: INSTAGRAM_URL
            }),
          },
        ],
        contextInfo: newsletter
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('FB Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await conn.sendMessage(m.chat, {
      text: `*📥 تـحـميـل فـيـديـوهـات فيـسـبوك*\n\n❌ خـطـا: ${e.message || e}`,
      contextInfo: newsletter
    }, { quoted: m })
  }
};

handler.help = ["fb <url>"];
handler.tags = ["downloader"];
handler.command = /^fb|فيسبوك|fbdl$/i;
handler.limit = false;

export default handler;
