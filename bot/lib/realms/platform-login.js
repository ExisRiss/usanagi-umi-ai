import {RealmError} from './service.js'
const VERIFY='https://alzriss-comunity.vercel.app/api/platform/verify-token'
// Only the platform's server-verified subject is accepted, never a phone or client user id.
export async function verifyJadibotToken(token,{fetchImpl=fetch}={}) {
 if(typeof token!=='string'||token.length<16||token.length>200||/\s/.test(token))throw new RealmError('Token akun Jadibot tidak valid.',401)
 let response,data
 try {
  response=await fetchImpl(VERIFY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),redirect:'error',signal:AbortSignal.timeout(12000)})
  if(response.status===401||response.status===400)throw new RealmError('Token akun tidak dikenali. Salin token aktif dari Profil website Jadibot.',401)
  if(response.status===403)throw new RealmError('Akun Jadibot tidak diizinkan.',403)
  if(!response.ok)throw new RealmError('Verifikasi Jadibot sedang tidak tersedia.',503)
  data=await response.json()
 }catch(error){if(error instanceof RealmError)throw error;throw new RealmError('Verifikasi Jadibot sedang tidak tersedia. Coba lagi sebentar.',503)}
 const subject=data?.user?.id
 if(data?.ok!==true||typeof subject!=='string'||!/^[a-zA-Z0-9_-]{8,128}$/.test(subject))throw new RealmError('Identitas akun Jadibot tidak valid.',401)
 return subject
}
