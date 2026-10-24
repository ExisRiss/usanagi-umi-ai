export async function handler(m,{db,config,sock}) {
  const user=db.getUser(m.sender)
  user.energi-=10
  db.setting('test-value',m.args[0])
  await sock.sendText(m.chat,JSON.stringify({command:m.command,text:m.text,setting:db.setting('test-value'),botName:config.bot.name}),m)
}
