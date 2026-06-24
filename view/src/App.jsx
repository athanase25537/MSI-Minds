import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Fanorona3x3 from './Fanorona3x3'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Fanorona3x3/>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
