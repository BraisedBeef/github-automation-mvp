import { _pathRefresh, _URLprefetch, _URLrefresh } from '@/apis/cdn/content'
import t from '@/utils/i18n'
export const filtetOptions = {
  // date: [{ label: t('一天'), value: 0 }],
  type: [
    { label: t('urlReresh'), value: 0, fn: _URLrefresh },
    { label: t('dirRefresh'), value: 1, fn: _pathRefresh },
    { label: t('urlPrefetch'), value: 2, fn: _URLprefetch },
  ],

  status: [
    { label: t('all'), value: 0 },
    { label: t('complete'), value: 1 },
    { label: t('processing'), value: 2 },
  ],
}
// export const statusArr = [
//   { label: t('fail'), value: 0, type: 'danger' },
//   { label: t('success'), value: 1, type: 'success' },
//   { label: t('processing'), value: 2, type: 'primary' },
// ]

export const getTxtUrls = (file: any) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsText(file) // 以二进制方式读取文件
  })
}

export const refreshDialogConfig = {
  refresh: {
    title: 'contentRefresh',
    tip: '内容刷新指从加速节点上删除指定的目录或者文件，使得用户请求重新回源获取，当您希望用户及时看到最新的信息可以采用此手动增存刷新方式',
    placeholder: {
      1: '输入的URL必须以http://或https://开头，URL之间以换行进行分隔，一行一个URL，如http://www.example.com/file01.html。其中，www.example.com为您的加速域名。如果您需要刷新首页，必须以"/"结尾，如http://www.example.com/。', // URL刷新
      2: '输入的目录必须以http://或https:/开头，使用"/"结尾，URL之间以换行进行分隔。一行一个URL，如http://www.example.com/folder01/。其中，www.example.com为您的加速域名。', // 目录刷新
    },
  },
  prefetch: {
    title: 'contentPrefetch',
    tip: '预取会在所有二级缓存节点上模拟用户的首次请求，让特定的内容缓存到各个节点中，提高用户的第一次下载体验，并减少回溯流量。<br/>注意：<br/>1.预取需要将文件分发到所有加速节点，完成的总时长取决于源站到加载节点的公网质量，一个100M的文件，预估在30分钟之内，偶尔有部分小运营商合较远地区会速度较慢，请您耐心等待。<br/>2.预取文件的过程中将从源站拉取文件，会提高您源站的带宽，导致网络访问变慢。',
    placeholder: {
      1: '输入的URL必须以http://或https://开头，URL之间以换行进行分隔。一行一个URL，如http://www.example.com/fle01.html。其中，www.example.com为您的加速域名。', // 预取
    },
  },
}
