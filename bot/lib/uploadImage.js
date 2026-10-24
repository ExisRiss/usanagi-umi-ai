import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Helper untuk membuat FormData secara dinamis
 */
function createFormData(buffer, fieldName, ext, mime) {
    const form = new FormData();
    form.append(fieldName, buffer, {
        filename: `file.${ext}`,
        contentType: mime
    });
    return form;
}

/**
 * Upload image/file dengan fallback uploader.
 *
 * Priority:
 * 1. Uguu
 * 2. 0x0.st
 * 3. Tmpfiles
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export default async function uploadImage(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError('Buffer diperlukan');
    }

    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
        throw new Error('Mime type file tidak dapat diketahui');
    }

    const ext = type.ext || 'bin';
    const mime = type.mime || 'application/octet-stream';
    const timeout = 30000;

    // Daftar uploader berurutan berdasarkan prioritas
    const uploaders = [
        {
            name: 'Uguu',
            run: async () => {
                const form = createFormData(buffer, 'files[]', ext, mime);
                const res = await fetch('https://uguu.se/upload', {
                    method: 'POST',
                    body: form,
                    headers: form.getHeaders(),
                    timeout
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                const data = await res.json();
                const url = data?.files?.[0]?.url || data?.url;

                if (url && /^https?:\/\//i.test(url)) return url;
                throw new Error('URL tidak ditemukan');
            }
        },
        {
            name: '0x0.st',
            run: async () => {
                const form = createFormData(buffer, 'file', ext, mime);
                const res = await fetch('https://0x0.st', {
                    method: 'POST',
                    body: form,
                    headers: form.getHeaders(),
                    timeout
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                const url = (await res.text()).trim();
                
                if (url && /^https?:\/\//i.test(url)) return url;
                throw new Error('URL tidak valid');
            }
        },
        {
            name: 'Tmpfiles',
            run: async () => {
                const form = createFormData(buffer, 'file', ext, mime);
                const res = await fetch('https://tmpfiles.org/api/v1/upload', {
                    method: 'POST',
                    body: form,
                    headers: form.getHeaders(),
                    timeout
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                
                const data = await res.json();
                const rawUrl = data?.data?.url;

                if (rawUrl) {
                    return rawUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
                }
                
                throw new Error('URL tidak ditemukan');
            }
        }
    ];

    // Eksekusi fallback secara otomatis menggunakan loop
    for (const uploader of uploaders) {
        try {
            return await uploader.run();
        } catch (e) {
            console.log(`[UPLOAD] ${uploader.name} gagal:`, e.message);
        }
    }

    // Jika loop selesai tanpa ada return, berarti seluruh uploader gagal
    throw new Error('Semua uploader gagal');
}