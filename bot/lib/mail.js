import fetch from 'node-fetch';

export async function createTempEmail() {
  const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
  const data = await res.json();
  return data.email_addr;
}

export async function waitForVerificationCode(email, timeoutMs = 60000) {
  const [sid_token, domain] = email.split('@');
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid_token}`);
    const data = await res.json();

    if (data.list && data.list.length > 0) {
      for (const mail of data.list) {
        const match = mail.mail_subject.match(/\b\d{6}\b/) || mail.mail_excerpt.match(/\b\d{6}\b/);
        if (match) {
          return match[0];
        }
      }
    }
  }

  throw new Error('Timeout: Kode verifikasi tidak ditemukan.');
}