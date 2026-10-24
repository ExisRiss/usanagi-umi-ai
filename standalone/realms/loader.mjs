const adapter=new URL('./sqlite.mjs',import.meta.url).href
export async function resolve(specifier,context,next){
 if(specifier.endsWith('core/awang-sqlite.js'))return {url:adapter,shortCircuit:true}
 return next(specifier,context)
}
