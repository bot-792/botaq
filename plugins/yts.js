import axios from 'axios'

// ===== معلومات القناة + الانستغرام =====
const channelName = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧 🇲🇦'
const CHANNEL_ID = '120363410733859643@newsletter'
const instaLink = 'https://instagram.com/adam.__.98'
const channelLink = 'https://whatsapp.com/channel/0029VbCxraN7T8bbAyc2j31J'

const newsletter = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: CHANNEL_ID,
        newsletterName: channelName
    }
}
// =================================================

let handler = async (m, { conn, text, usedPrefix: _p, command }) => {

  if(command === 'ytinfo'){
    let url = text
    if(!url) return m.reply('ارسل الرابط')

    await conn.sendMessage(m.chat, { text: '⏳*جـاري جـلـب مـعـلـومـات الـفـيـديـو...*', contextInfo: newsletter }, { quoted: m })

    try{
      let { data } = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`)
      let videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]

      let caption = `🎬 *مـعـلـومـات الـفـيـديـو*\n\n`
      caption += `📛 *الـعـنـوان :* ${data.title}\n`
      caption += `👤 *الـقـنـاة :* ${data.author_name}\n`
      caption += `🔗 *الـرابـط :* ${url}`

      return await conn.sendButton(m.chat, {
        image: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
        caption: caption,
        buttons: [
          {name: 'cta_url', buttonParamsJson: JSON.stringify({display_text: '📢 قــنــاة الـواتــســاب', url: channelLink})},
          {name: 'cta_url', buttonParamsJson: JSON.stringify({display_text: '📸 حـسابــي انـسـتـغـرام', url: instaLink})},
        ],
        contextInfo: newsletter
      }, { quoted: m })

    }catch(e){
      return m.reply(`❌ خطأ: ${e.message}`)
    }
  }

  // هنا حيدت الزر
  if (!text) {
    return await conn.sendMessage(m.chat, { 
        text: `📥 *الـرجـاء إدخـال اســم الـفـيـديـو وسـأقـوم بـالـبحـث لـك فــوراً*\n\n📌 *مـثـال :* \`${_p}بحث معومات حـول عـالم البـوتـات\``,
        contextInfo: newsletter
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { text: '🔍*جـاري الـبـحـث عـن الـفـيـديـو... انـتـظـر لـحـظـة* ⏳', contextInfo: newsletter }, { quoted: m })

  try {
    let { data } = await axios.post('https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
      context: { client: { clientName: "WEB", clientVersion: "2.20240101.01.00" } },
      query: text
    }, { timeout: 15000 })

    let videos = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
.filter(x => x.videoRenderer)
.slice(0, 10)
.map(x => x.videoRenderer)

    if (!videos.length) {
        throw `❌ *لـم يـتـم الـعـثـور عـلـى اي نـتـائـج*`
    }

    let thumbnail = videos[0].thumbnail.thumbnails.pop().url

    let caption = `📋 *نـتـائـج الـبـحـث عـن :* ${text}\n📊 *عـدد الـنـتـائـج :* ${videos.length}\n\n`
    caption += `*by mysto off*`

    let sections = [
      {
        title: "📺 اخـتـر رقـم الـفـيـديـو لـعـرض الـمـعـلـومـات",
        rows: videos.map((v, i) => ({
          title: `${i+1}. ${v.title.runs[0].text.substring(0, 60)}`,
          description: `${v.ownerText.runs[0].text}`,
          id: `${_p}ytinfo https://youtu.be/${v.videoId}`
        }))
      }
    ]

    await conn.sendButton(m.chat, {
        image: { url: thumbnail },
        caption: caption,
        buttons: [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '⬇️ اضـــغـــط هــنــا لـلاخـتـيـار',
                    sections: sections
                }),
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '📢 قــنــاة الـواتــســاب',
                    url: channelLink
                }),
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '📸 حـسابــي انـسـتـغـرام',
                    url: instaLink
                }),
            },
        ],
        contextInfo: newsletter
    }, { quoted: m, mentions: [m.sender] })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch(e) {
    console.log(e)
    await conn.sendMessage(m.chat, {
      text: `❌ *خـطـأ فـي الـبـحـث :* ${e.message || e}`,
      contextInfo: newsletter
    }, { quoted: m })
  }
}

handler.help = [' <البحث>']
handler.tags = ['search']
handler.command = ['yts', 'ytinfo' , 'بحث']
handler.limit = false
export default handler
