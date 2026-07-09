import axios from 'axios'

const triggerDownload = (href: string, fileName?: string) => {
  const a = document.createElement('a')
  if (fileName) a.download = fileName
  a.href = href
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const download = async (source: string | Blob, fileName?: string) => {
  let href = ''
  let shouldRevoke = false

  if (typeof source === 'string') {
    try {
      const response = await axios.get(source, { responseType: 'blob' })
      href = window.URL.createObjectURL(new Blob([response.data]))
      shouldRevoke = true
    } catch (error) {
      console.error(error)
      href = source
    }
  } else {
    href = window.URL.createObjectURL(new Blob([source]))
    shouldRevoke = true
  }

  triggerDownload(href, fileName)
  if (shouldRevoke) {
    window.URL.revokeObjectURL(href)
  }
}

export const downloadExportFiles = (data: any, fileName?: string) => {
  try {
    const href = window.URL.createObjectURL(new Blob([data], { type: 'charset=utf-8' }))
    triggerDownload(href, fileName || '文件导出.xlsx')
    window.URL.revokeObjectURL(href)
  } catch (error) {
    console.log('downloadExportFiles error', error)
  }
}

export const downloadText = (filename: string, text: string) => {
  const href = window.URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  triggerDownload(href, filename)
  window.URL.revokeObjectURL(href)
}
