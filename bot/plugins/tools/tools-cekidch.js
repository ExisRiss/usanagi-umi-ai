
const handler = async (m, { text }) => {
    if (!text) return m.reply("🍌 Harap masukkan link channel WhatsApp!");
    if (!text.includes("https://whatsapp.com/channel/")) return m.reply("Link tautan tidak valid!");

    let result = text.split("https://whatsapp.com/channel/")[1];
    let res = await conn.newsletterMetadata("invite", result);

    let teks = `
*✨ ID:* ${res.id}
`;

    return m.reply(teks);
};

handler.help = ["cekidch"]
handler.tags = ["tools"]
handler.command = ["cekidch", "idch"];
export default handler;