import React, { useState, useEffect } from 'react'
import { ModalDialog } from './dialogs'
import { useSetting } from './Settings'

export const CameraSelectionDialog: React.FC = () => {
  const [devices, setDevices] = useState<Array<MediaDeviceInfo> | null>(null)
  const [currentCam, setCurrentCam] = useSetting<string | null>('currentCameraId', null)

  const refreshDevices = async () => {
    const devs = await navigator.mediaDevices.enumerateDevices()
    setDevices(devs.filter(dev => dev.kind === 'videoinput'))
  }
  
  useEffect(() => {
    refreshDevices()
  }, [])

  
  return (
    <ModalDialog>
      <h3 style={{minWidth: '400px'}}>Select camera</h3>
      {devices === null ? <em>Detecting...</em> : devices.length === 0 ? <em>No camera found</em> : (
        <ul>
          {devices.map(device => (
            <li key={device.deviceId}>
              <pre>{JSON.stringify(device, null, 2)}</pre>
              {device.deviceId === currentCam ? (
                <>
                  <strong>Currently used.</strong>
                  <button onClick={() => setCurrentCam(null)}>Forget</button>
                </>
                ) : (
                  <button onClick={() => setCurrentCam(device.deviceId)}>Use this</button>
                )
              }
            </li>
          ))}
        </ul>
      )}
      <br />
      {devices !== null && <button onClick={refreshDevices}>Refresh</button>}
    </ModalDialog>
  )
}
