// Narrow compatibility patch for the installed Elaina assertSessions implementation.
// Never edits auth keys, invents LIDs, retries a sent message or suppresses delivery errors.
import fs from 'node:fs'
import path from 'node:path'
const before = `            const wireJids = [
                ...jidsRequiringFetch.filter(jid => !!isLidUser(jid) || !!isHostedLidUser(jid)),
                ...((await signalRepository.lidMapping.getLIDsForPNs(jidsRequiringFetch.filter(jid => !!isPnUser(jid) || !!isHostedPnUser(jid)))) || []).map(a => a.lid)
            ];`
const after = `            // UMI_SESSION_WIRE_V1: retain unmapped PN/device identities; never send an empty key IQ.
            const pnJids = jidsRequiringFetch.filter(jid => isPnUser(jid) || isHostedPnUser(jid));
            const pairs = pnJids.length ? (await signalRepository.lidMapping.getLIDsForPNs(pnJids)) || [] : [];
            const mapped = new Map(pairs.filter(pair => pnJids.includes(pair.pn) && (isLidUser(pair.lid) || isHostedLidUser(pair.lid))).map(pair => [pair.pn, pair.lid]));
            const wireJids = [...new Set([
                ...jidsRequiringFetch.filter(jid => isLidUser(jid) || isHostedLidUser(jid)),
                ...pnJids.map(jid => mapped.get(jid) || jid)
            ])];
            if (!wireJids.length) throw new Error('No supported recipient identities for session key query');`
export function patchSessionSource(source) {
  if (source.includes(after)) return { source, changed: false }
  if (source.split(before).length !== 2 || source.includes('UMI_SESSION_WIRE_V1')) throw new Error('Unknown Baileys session source; manual compatibility review required')
  return { source: source.replace(before, after), changed: true }
}
export function repairBaileysSessions(root) {
  const file = path.join(root, 'node_modules/@rexxhayanasi/elaina-baileys/src/Socket/messages-send.js')
  const result = patchSessionSource(fs.readFileSync(file, 'utf8'))
  if (result.changed) {
    const temp = file + '.umi-' + process.pid + '.tmp'
    try { fs.writeFileSync(temp, result.source, { mode: fs.statSync(file).mode }); fs.renameSync(temp, file) }
    finally { try { fs.unlinkSync(temp) } catch {} }
  }
  return result.changed ? 'applied' : 'already-current'
}
