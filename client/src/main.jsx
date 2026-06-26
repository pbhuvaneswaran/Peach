import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppV1 from './AppV1.jsx'
import AppV2 from './AppV2.jsx'
import AppV3 from './AppV3.jsx'
import VersionToggle, { useVersion } from './VersionToggle.jsx'

function Root() {
  const { version, setV } = useVersion()
  const handleSelect = (v) => {
    setV(v)
    window.location.href = '/'
  }
  return (
    <>
      {version === 'v1' ? <AppV1 /> : version === 'v3' ? <AppV3 /> : <AppV2 />}
      <VersionToggle version={version} onSelect={handleSelect} />
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
