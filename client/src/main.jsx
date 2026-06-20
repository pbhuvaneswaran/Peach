import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppV1 from './AppV1.jsx'
import AppV2 from './AppV2.jsx'
import VersionToggle, { useVersion } from './VersionToggle.jsx'

function Root() {
  const { version, toggle } = useVersion()
  return (
    <>
      {version === 'v1' ? <AppV1 /> : <AppV2 />}
      <VersionToggle version={version} onToggle={toggle} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
