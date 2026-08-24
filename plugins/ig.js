// ============== Instagram Downloader ==============
import axios from 'axios';

const DOWNREELS_API = "https://downreels.com/api/fetch.php"
const HEADERS = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "origin": "https://downreels.com",
  "referer": "https://downreels.com/en/download-video-instagram/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

// ===== معلومات القناة =====
const channelName = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧 🇲🇦'
const CHANNEL_ID = '120363410733859643@newsletter'
const INSTAGRAM_URL = `https://instagram.com/adam.__.98`
const DEVELOPER = '*mysto._.98*' // زدنا هادي
const newsletter = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: CHANNEL_ID,
        newsletterName: channelName
    }
}
// =====================================

let handler = async (m, { conn, args, usedPrefix, command }) => {

    if (!args[0]) {
        return conn.sendMessage(m.chat, {
            text: `*📥 تـحـميـل فـيـديـوهـات انـستـغرام*\n\n📌 *الامـر:* \`${usedPrefix + command} لـيـنـك\`\n💡 *مـثـال:* \`${usedPrefix + command} https://www.instagram.com/reel/xxx\``,
            contextInfo: newsletter
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    await conn.sendMessage(m.chat, { text: `*⏱️ انتــظــر ثــوانــــي*\n\n🔍 يـتـم جـلـب الـمـيـديـا... ⏳`, contextInfo: newsletter }, { quoted: m })

    try {
        const response = await axios.post(DOWNREELS_API, { url: args[0] }, { headers: HEADERS, timeout: 30000 });
        const data = response.data;

        if (data.status!== "ok" ||!data.videos || data.videos.length === 0) {
            throw new Error('فـشـل الاسـتـخـراج. تـاكـد الـحـسـاب عـام');
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        const getBestVideo = (videoList) => {
            const hdVideo = videoList.find(v => v.quality && v.quality.toLowerCase().includes("hd"));
            return hdVideo? hdVideo.url : videoList[0].url;
        };

        if (data.videos.length === 1) {
            let downloadUrl = getBestVideo(data.videos);
            let title = data.title || data.desc || 'Instagram Reel'

            // الكابتشن الجديد بحال ما بغيتي
            let caption = `*📥 تـم تـحـمـيـل بنـجـاح*

*📀 الـعـنـوان :* ${title}
*👤 مـطـور :* ${DEVELOPER}
*🔗 الـرابـط :* ${args[0]}`

            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
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
            }, { quoted: m });

        } else if (data.videos.length > 1) {
            await conn.sendMessage(m.chat, {
                text: `*⏱️ انتــظــر ثــوانــــي*\n\n📁 تـم الـعـثـور عـلـى ألـبـوم فـيـه (${data.videos.length}) مـلـفـات\nجـاري الارسـال...`,
                contextInfo: newsletter
            }, { quoted: m })

            for (const item of data.videos) {
                if (item.isVideo) {
                    await conn.sendMessage(m.chat, { video: { url: item.url }, contextInfo: newsletter }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, { image: { url: item.url }, contextInfo: newsletter }, { quoted: m });
                }
            }
            await conn.sendMessage(m.chat, {
                text: `*تـم الارسـال بـنـجـاح ✅*`,
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
            }, { quoted: m })
        }

    } catch (e) {
        console.error('Downreels Error Log:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: `*📥 تـحـميـل فـيـديـوهـات انـستـغرام*\n\n❌ خـطـا: ${e.message || e}`,
            contextInfo: newsletter
        }, { quoted: m })
    }
}

handler.help = ['insta <url>'];
handler.tags = ['downloader'];
handler.command = /^(insta|استغرام|ig|)$/i;
handler.limit = false
export default handler;
