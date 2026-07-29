export async function uploadImageFile(file, altText = '') {
  const token = window.localStorage.getItem('bgd_access_token');
  const fileData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unable to read file'));
        return;
      }
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      altText,
      body: fileData,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Unable to upload image.');
  }

  return data.previewUrl || data.s3Url;
}
