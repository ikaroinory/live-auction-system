import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from '@douyinfe/semi-ui'
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN'
import { SWRConfig } from 'swr'
import { swrConfig, fetcher } from '@/hooks/useSWRConfig'
import App from './App'
import './assets/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <SWRConfig value={{ ...swrConfig, fetcher }}>
        <App />
      </SWRConfig>
    </ConfigProvider>
  </React.StrictMode>
)
