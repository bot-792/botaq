const handler = async (m, { conn }) => {
  if (!m.message) return

  const isSticker =
    m.mtype === 'stickerMessage' ||
    !!m.message?.stickerMessage

  if (!isSticker) return

  try {
    await conn.sendMessage(
      m.chat,
      {
        audio: {
          url: 'https://files.catbox.moe/lvgs2c.mp3'
        },
        mimetype: 'audio/mpeg',
        ptt: true
      },
      {
        quoted: m
      }
    )
  } catch (e) {
    console.error('❌ Sticker Auto Error:', e)
  }
}

handler.before = handler

export default handler
