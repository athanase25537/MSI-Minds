import React from 'react'

function AIThinking() {
  return (
    <div className="ai-thinking-overlay">
      <div className="ai-thinking-card">
        <div className="thinking-animation">
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
          <div className="thinking-dot"></div>
        </div>
        <p> L'IA réfléchit...</p>
      </div>
    </div>
  )
}

export default AIThinking