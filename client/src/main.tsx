import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner"
import { ConfigProvider } from "antd";
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#18181b",
        }
      }}
    >
      <App />
      <Toaster />
    </ConfigProvider>
  </React.StrictMode>,
)
