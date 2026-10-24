import axios from 'axios'
import FormData from 'form-data'

async function uploadUguu(buffer, filename = 'file.bin') {
  const form = new FormData()
  form.append('files[]', buffer, filename)

  const { data } = await axios.post(
    'https://uguu.se/upload.php',
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    }
  )

  if (!data?.files?.length) {
    throw new Error('Upload Uguu gagal.')
  }

  return data.files[0].url
}

async function uploadKen4(buffer, filename = 'file.bin', permanent = false) {
  const form = new FormData()

  form.append('file', buffer, filename)

  if (permanent) {
    form.append('expiry', 'permanent')
    form.append('pin', 'ryuken')
  }

  const { data } = await axios.post(
    'https://ken4-tmp.hf.space/api/upload',
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    }
  )

  if (!data?.status) {
    throw new Error(data?.message || 'Upload Ken4 gagal.')
  }

  return (
    data?.result?.url ||
    data?.result?.link ||
    data?.url
  )
}

export async function uploadFile(input, filename = 'file.bin', permanent = false) {
  let buffer

  if (Buffer.isBuffer(input)) {
    buffer = input
  } else if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
    const { data } = await axios.get(input, {
      responseType: 'arraybuffer'
    })
    buffer = Buffer.from(data)
  } else {
    throw new Error('Input harus berupa Buffer atau URL.')
  }

  try {
    console.log('[Uploader] Upload ke Uguu...')
    return await uploadUguu(buffer, filename)
  } catch (e) {
    console.warn('[Uploader] Uguu gagal:', e.message)
    console.log('[Uploader] Mencoba Ken4...')
    return await uploadKen4(buffer, filename, permanent)
  }
}

export default uploadFile