export function success (body = {}, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': ['https://blog-cms-bay-eight.vercel.app', '*'],
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  }
}

export function error (message, statusCode = 500) {
  return success({ error: message }, statusCode)
}
