// JITOSSA BOT - APK DOWNLOADER + CHANNEL FOR ALL
import axios from 'axios'

const MAX_RESULTS = 10
const BOT_NAME = 'JITOSSA BOT'
const DEVELOPER_NUMBER = '212698498657'

// ===== مـعـلـومـات الـقـنـاة =====
const instagram = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧 🇲🇦'
const newsletterJid = '120363410733859643@newsletter'
const newsletter = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: newsletterJid,
        newsletterName: `${instagram}`
    }
}
// =================================================

global.apkSessions = global.apkSessions || {}

function safeFileName(name) {
    return String(name || 'application').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 100)
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'غيـر معـروف'
    const n = Number(bytes)
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`
    return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const aptoide = {
    search: async function (query) {
        const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=${MAX_RESULTS}`
        const res = await axios.get(url, { timeout: 30000 })
        const list = res.data?.datalist?.list
        if (!Array.isArray(list)) return []
        return list.slice(0, MAX_RESULTS).map(app => {
            const file = app.file || {}
            return {
                name: app.name || 'Unknown',
                package: app.package || '',
                icon: app.icon || null,
                version: file.vername || file.vercode || 'N/A',
                size: file.filesize || app.size || 0,
                download: app.stats?.downloads || 0,
                developer: app.store?.name || app.developer?.name || 'Unknown',
                path: file.path || null,
                path_alt: file.path_alt || file.path || null,
                updated: app.updated || 'N/A'
            }
        }).filter(app => app.name)
    }
}

async function sendApk(conn, m, app) {
    if (!app) throw new Error('التطبيق غير موجود.')
    const downloadUrl = app.path_alt || app.path
    if (!downloadUrl) throw new Error('رابط تحميل APK غير متوفر.')

    const info = `*مـعلــــومــات التـطبـيـــــــق*\n\n*✨ الاسـم :* ${app.name}\n*🔖 الاصــدار :* ${app.version}\n*📦 الـحزمـة :* ${app.package || 'N/A'}\n*🛠️ الـمطـور :* ${app.developer}\n*⚙️ الحـجـم :* ${formatSize(app.size)}\n*📥 الـتحـميلات :* ${app.download || 0}\n*🗓️ التـحديـث :* ${app.updated}`

    await conn.sendMessage(m.chat, {
        image: { url: app.icon },
        caption: info,
        contextInfo: newsletter // 1. الصورة فيها القناة
    }, { quoted: m }).catch(() => m.reply({text: info, contextInfo: newsletter}))

    await m.react('⬇️').catch(() => {})

    const apkCaption = `*🔖اسـم تطبـيق :* ${app.name}\n\n*🇲🇦 بـواسـطـة : ${BOT_NAME}*\n*👑 الـمطــور : 𝗠𝗬𝗦𝗧𝗢 𝗢𝗙𝗙*`

    await conn.sendMessage(m.chat, {
        document: { url: downloadUrl },
        fileName: `${safeFileName(app.name)}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: apkCaption,
        contextInfo: newsletter // 2. الـapk فيه القناة
    }, { quoted: m })
    await m.react('✅').catch(() => {})
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        const sender = m.sender
        const input = String(text || '').trim()

        if (!input) {
            const intro = `📥 *الـرجـاء إدخـال اســم الـتـطـبـيـق وسـأقـوم بـالـبحـث لـك فــوراً*\n\n📌 *مـثـال :* ${usedPrefix}${command} واتساب الاعمال\n📌 *مـثـال :* ${usedPrefix}${command} capcut\n📌 *مـثـال :* ${usedPrefix}${command} pixellab`
            // 3. المقدمة فيها القناة
            await conn.sendMessage(m.chat, { text: intro, contextInfo: newsletter }, { quoted: m })
            return
        }

        if (/^\d+$/.test(input) && global.apkSessions[sender]) {
            const number = parseInt(input)
            const session = global.apkSessions[sender]
            const app = session.data[number - 1]
            if (!app) return m.reply({text: `الرقم غير صحيح. عندك ${session.data.length} نتائج`, contextInfo: newsletter})
            if (session.downloading) return m.reply({text: `كاين تحميل دابا. صبر شوية`, contextInfo: newsletter})

            session.downloading = true
            try {
                await sendApk(conn, m, app)
            } catch (e) {
                console.error(e)
                await m.reply({text: `خـطــأ فــي التـحـميـل: ${e.message}`, contextInfo: newsletter})
                await m.react('❌').catch(() => {})
            } finally {
                session.downloading = false
            }
            return
        }

        await m.react('🔎').catch(() => {})
        const results = await aptoide.search(input).catch(() => null)
        if (!results || results.length === 0) return m.reply({text: `لايــوجــــد: ${input}`, contextInfo: newsletter})

        global.apkSessions[sender] = { data: results, downloading: false }

        const rows = results.map((app, index) => ({
            title: `${index + 1}. ${app.name}`,
            description: `الاصـــدار : ${app.version} | الحــجـم : ${formatSize(app.size)}`,
            id: `${usedPrefix}${command} ${index + 1}`
        }))

        const msg = `📱 *نتــائــج البــحــث:* ${input}\n*عـــدد النتـــائــج:* ${results.length}\n\n*اخـتار تطـبيــق الــذي تـريــد تحـمــيلـه*`

        // 4. النتائج بالازرار + القناة
        await conn.sendButton(m.chat, {
            text: msg,
            footer: `${BOT_NAME}`,
            buttons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '📱 اخـتار التـطبــيــق',
                        sections: [{
                            title: `نــتائـــج: ${input}`,
                            rows: rows
                        }]
                    })
                }
            ]
        }, { quoted: m, contextInfo: newsletter })

        await m.react('✅').catch(() => {})
    } catch (e) {
        console.error(e)
        await m.react('❌').catch(() => {})
        await conn.sendMessage(m.chat, { text: `وقع خطأ: ${e.message}`, contextInfo: newsletter }, { quoted: m })
    }
}

handler.help = ['تطبيق <اسم>', 'تطبيق <رقم>']
handler.tags = ['downloader']
handler.command = /^(apk|تطبيق)$/i
handler.limit = false

export default handler
