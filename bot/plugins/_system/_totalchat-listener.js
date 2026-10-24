import fs from 'fs'



const dbPath = './lib/chat.json'



/* ================= INIT DB ================= */

const ensureDB = () => {

    if (!fs.existsSync('./lib')) {

        fs.mkdirSync('./lib', { recursive: true })

    }

    if (!fs.existsSync(dbPath)) {

        fs.writeFileSync(dbPath, JSON.stringify({}))

    }

}



/* ================= LOAD ================= */

const loadDB = () => {

    try {

        ensureDB()

        return JSON.parse(fs.readFileSync(dbPath))

    } catch {

        return {}

    }

}



/* ================= SAVE ================= */

const saveDB = (data) => {

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

}



/* ================= LISTENER ================= */

export async function before(m) {

    if (!m.isGroup) return

    if (!m.sender) return

    if (m.key.fromMe) return



    let db = loadDB()



    if (!db[m.chat]) db[m.chat] = {}

    if (!db[m.chat][m.sender]) db[m.chat][m.sender] = 0



    db[m.chat][m.sender] += 1



    saveDB(db)

}