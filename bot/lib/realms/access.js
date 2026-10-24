// Narrow authentication/status exception, not a blanket bypass for RPG commands.
export function isRealmAccessCommand(text, prefix) {
 const body=String(text||'').trim(),active=String(prefix||'')
 return Boolean(active&&body.startsWith(active)&&/^(?:realms|eclipserealms)\s+(?:login|link|putus|status)\s*$/i.test(body.slice(active.length)))
}
