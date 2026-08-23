import * as cheerio from 'cheerio';

const mediaRegex = /https?:\/\/(www\.)?mediafire\.com\/(file|folder)\/(\w+)/;

// ===== مـعـلـومـات الـقـنـاة + انـسـتـغـرام =====
const instagram = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧 🇲🇦'
const newsletter = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363410733859643@newsletter',
        newsletterName: `$adam.__.98`
    }
}
// =====================================

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.sendMessage(m.chat, {
        text: `📌 *مـثـال الـاسـتـعـمـال*\n\n${usedPrefix}${command} https://www.mediafire.com/file/xxx/file`,
        contextInfo: newsletter
    }, { quoted: m })

    if (!mediaRegex.test(text)) return conn.sendMessage(m.chat, {
        text: `❌ *الـرابـط غـيـر صـالـح*\n\nالـرجـاء وضـع رابـط mediafire صـحـيـح`,
        contextInfo: newsletter
    }, { quoted: m })

    try {
        await conn.sendMessage(m.chat, {
            text: `⏳ *كـنـجـيـب الـمـلـف مـن mediafire...*`,
            contextInfo: newsletter
        }, { quoted: m })

        let res = await mediafire(text);

        // نـص بـسـيـط بـلا تـصـمـيـم
        let caption = `*📂 مـعـلـومـات الـمـلـف*\n\n`
        caption += `*📌 الاسـم:* ${res.filename}\n`
        caption += `*📊 الـحـجـم:* ${res.sizeReadable}\n`
        caption += `*🗂️ الـنـوع:* ${res.filetype}\n`
        caption += `*🔐 الـخـصـوصـيـة:* ${res.privacy}\n`
        caption += `*👤 الـمـالـك:* ${res.owner_name}\n\n`
        caption += `✅ *تـم الـتـحـمـيـل مـن mediafire*\n`
        caption += `📲 *تـابـعـنـي فـي الانـسـتـغـرام: @${instagram}*`

        // صيفط الملف
        await conn.sendMessage(
            m.chat,
            {
                document: { url: res.download },
                fileName: res.filename,
                mimetype: res.mimetype,
                caption: caption,
                contextInfo: newsletter
            },
            { quoted: m }
        );

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.chat, {
            text: `❌ *فـشـل فـي جـلـب الـمـلـف*\n\nتـحـقـق مـن الـرابـط وحـاول مـرة اخـرى`,
            contextInfo: newsletter
        }, { quoted: m })
    }
};

handler.help = ['ميديافاير <الـرابـط>'];
handler.tags = ['تـحـمـيـل'];
handler.command = /^(ميديافاير|mediafire|mf)$/i;
handler.limit = false;
handler.register = false;

export default handler;

async function mediafire(url) {
    const match = mediaRegex.exec(url);
    if (!match) throw 'Invalid URL!';

    const id = match[3];
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const download = $('a#downloadButton').attr('href');
    if (!download) throw 'Failed to get download link from MediaFire page.';

    const infoResponse = await fetch(`https://www.mediafire.com/api/1.5/file/get_info.php?response_format=json&quick_key=${id}`);
    const json = await infoResponse.json();
    if (json.response.result!== 'Success') throw 'Failed to fetch file information.';

    const info = json.response.file_info;
    const size = parseInt(info.size);
    const ext = info.filename.split('.').pop();

    return {
        filename: info.filename,
        ext: ext,
        size: size,
        sizeReadable: formatBytes(size),
        download: download,
        filetype: info.filetype,
        mimetype: info.mimetype || `application/${ext}`,
        privacy: info.privacy,
        owner_name: info.owner_name,
    };
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
