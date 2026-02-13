import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputDir = path.join(process.cwd(), 'data', 'external')

async function downloadUppgiftskravXml(): Promise<void> {
  const pageUrl = process.env.UPPGIFTSKRAV_DATA_PAGE_URL || 'https://www.uppgiftskrav.se/uppgiftskrav/data'
  const pageResponse = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  })

  if (!pageResponse.ok) {
    throw new Error(`Failed to fetch data page (${pageResponse.status})`)
  }

  const html = await pageResponse.text()
  const actionMatch = html.match(/<form id="form"[^>]*action="([^"]+)"/i)
  const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/i)
  const clientWindowMatch = html.match(/name="javax\.faces\.ClientWindow"[^>]*value="([^"]+)"/i)
  const downloadButtonMatch = html.match(/<button[^>]*name="([^"]+)"[^>]*>\s*<span[^>]*>Ladda ner uppgiftskrav\.xml<\/span>/i)

  if (!actionMatch || !viewStateMatch || !downloadButtonMatch) {
    throw new Error('Could not parse download form fields from uppgiftskrav data page')
  }

  const actionUrl = new URL(actionMatch[1], 'https://www.uppgiftskrav.se').toString()
  const setCookieHeader = pageResponse.headers.get('set-cookie')
  const cookieHeader = (setCookieHeader || '')
    .split(',')
    .map(cookie => cookie.split(';')[0].trim())
    .filter(Boolean)
    .join('; ')

  const form = new URLSearchParams()
  form.set('form', 'form')
  form.set(downloadButtonMatch[1], downloadButtonMatch[1])
  form.set('javax.faces.ViewState', viewStateMatch[1])
  if (clientWindowMatch) {
    form.set('javax.faces.ClientWindow', clientWindowMatch[1])
  }

  const downloadResponse = await fetch(actionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/xml,text/xml,*/*',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      Referer: pageUrl,
      Origin: 'https://www.uppgiftskrav.se',
    },
    body: form.toString(),
    redirect: 'follow',
  })

  if (!downloadResponse.ok) {
    throw new Error(`Failed to download uppgiftskrav XML (${downloadResponse.status})`)
  }

  const xmlBuffer = Buffer.from(await downloadResponse.arrayBuffer())
  const targetFile = path.join(outputDir, 'uppgiftskrav.xml')
  await writeFile(targetFile, xmlBuffer)

  const meta = {
    source: pageUrl,
    downloadedAt: new Date().toISOString(),
    sizeBytes: xmlBuffer.length,
    contentType: downloadResponse.headers.get('content-type') || 'application/xml',
  }
  await writeFile(path.join(outputDir, 'uppgiftskrav.meta.json'), JSON.stringify(meta, null, 2), 'utf8')

  console.log(`✅ Downloaded uppgiftskrav XML (${xmlBuffer.length} bytes)`)
}

async function tryDownloadLivsmedelsverketData(): Promise<void> {
  const candidateUrls = [
    process.env.LIVSMEDELSVERKET_API_URL,
    'https://dataportal.livsmedelsverket.se/riskklassningkodverk/api/verksamhetstyper',
    'https://dataportal.livsmedelsverket.se/riskklassningkodverk/api',
    'https://dataportal.livsmedelsverket.se/riskklassningkodverk/openapi.json',
  ].filter((value): value is string => Boolean(value))

  const probeResults: Array<{ url: string; status: number | null; ok: boolean; note?: string }> = []

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json,text/plain,*/*' },
        redirect: 'follow',
      })

      probeResults.push({ url, status: response.status, ok: response.ok })

      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      if (!contentType.includes('json') && !text.trim().startsWith('{') && !text.trim().startsWith('[')) {
        continue
      }

      await writeFile(path.join(outputDir, 'livsmedelsverket.json'), text, 'utf8')
      await writeFile(
        path.join(outputDir, 'livsmedelsverket.meta.json'),
        JSON.stringify(
          {
            source: url,
            downloadedAt: new Date().toISOString(),
            sizeBytes: Buffer.byteLength(text, 'utf8'),
            contentType,
          },
          null,
          2
        ),
        'utf8'
      )

      console.log(`✅ Downloaded Livsmedelsverket data from ${url}`)
      return
    } catch (error) {
      probeResults.push({
        url,
        status: null,
        ok: false,
        note: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  await writeFile(path.join(outputDir, 'livsmedelsverket.probe.json'), JSON.stringify(probeResults, null, 2), 'utf8')
  console.warn('⚠️ Could not download Livsmedelsverket dataset automatically. Probe results saved to data/external/livsmedelsverket.probe.json')
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  console.log('🌐 Downloading external datasets for demo mode...')
  await downloadUppgiftskravXml()
  await tryDownloadLivsmedelsverketData()
  console.log('🎉 External data download completed')
}

main().catch(error => {
  console.error('❌ External data download failed:', error)
  process.exit(1)
})
