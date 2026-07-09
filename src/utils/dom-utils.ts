import { message } from '@/utils/message'
import t from '@/utils/i18n'

export const _getElClientX = (el: any) => {
  let left = el.offsetLeft
  let top = el.offsetTop
  let val = el.offsetParent
  while (val != null) {
    left += val.offsetLeft
    top += val.offsetTop
    val = val.offsetParent
  }
  return {
    left,
    top,
  }
}

export const _getElClient2 = (el: any) => {
  return {
    top: el.getBoundingClientRect().top,
    left: el.getBoundingClientRect().left,
  }
}

export function handleCopyValue(text: any) {
  if (!navigator.clipboard && window.isSecureContext) {
    return (navigator.clipboard as any).writeText(text)
  } else {
    const textArea = document.createElement('textarea')
    textArea.style.position = 'fixed'
    textArea.style.top = textArea.style.left = '-100vh'
    textArea.style.opacity = '0'
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve(text) : reject()
      textArea.remove()
    })
  }
}

export function getFileTypeByExtension(filename) {
  if (!filename) {
    return ''
  }
  const extension = filename.toLowerCase().split('.').pop()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv']
  if (imageExtensions.indexOf(extension) !== -1) {
    return 'image'
  } else if (videoExtensions.indexOf(extension) !== -1) {
    return 'video'
  } else {
    return ''
  }
}

export const copyText = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  message.success(t('copyAlreadyTip'))
}
