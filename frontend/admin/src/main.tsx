import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from '@douyinfe/semi-ui'
import zhCN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN'
import { SWRConfig } from 'swr'
import { swrConfig, fetcher } from '@/hooks/useSWRConfig'
import './assets/styles/index.css'
import { RouterProvider } from 'react-router'
import { routers } from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider timeZone="GMT+08:00" locale={zhCN}>
      <SWRConfig value={{ ...swrConfig, fetcher }}>
        <RouterProvider router={routers} />
      </SWRConfig>
    </ConfigProvider>
  </React.StrictMode>
)
