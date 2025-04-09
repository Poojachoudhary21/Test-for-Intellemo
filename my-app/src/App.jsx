import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Canvas from './components/Canvas'
import CanvasWithTextInput from './components/CanvasWithTextInput'
import VideoOnCanvas from './components/VideoOnCanvas'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Canvas />
     <CanvasWithTextInput />
     <VideoOnCanvas />
     
    </>
  )
}

export default App
