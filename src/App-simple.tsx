import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Cvety.kz AI Assistant</h1>
      <p>Тест загрузки: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Счётчик: {count}
      </button>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Чат интерфейс</h2>
        <p>Если видите это сообщение - React работает!</p>
      </div>
    </div>
  )
}

export default App