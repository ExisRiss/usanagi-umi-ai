// Only database location is redirected. Real SQLite and legacy RPG adapter run.
const fixture=new URL('./fixtures/realms-sqlite.mjs',import.meta.url).href
export async function resolve(specifier,context,nextResolve){
 if(specifier.endsWith('core/awang-sqlite.js'))return {url:fixture,shortCircuit:true}
 return nextResolve(specifier,context)
}
