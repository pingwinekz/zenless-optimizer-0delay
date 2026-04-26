import { get as httpsGet } from 'https'

export function fetchJsonFromUrl(url: string, debug = false) {
  debug && console.log('Fetching', url)
  return new Promise((resolve, reject) => {
    const req = httpsGet(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      let data = ''

      // Accumulate data as it comes in
      response.on('data', (chunk) => {
        data += chunk
      })

      // Resolve the promise once all data has been received
      response.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json)
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${(error as Error).message}`))
        }
      })
    }).on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`))
    })
  })
}
