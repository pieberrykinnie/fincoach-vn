import { useEffect, useState } from 'react'
import './App.css'

interface Jar {
  id: number;
  name: string;
  allocation_percent: number;
  balance: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  jar_name: string;
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [jars, setJars] = useState<Jar[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [points, setPoints] = useState(0)
  const [insightQuery, setInsightQuery] = useState('')
  const [insightAnswer, setInsightAnswer] = useState('')

  const API_URL = 'http://localhost:8000'

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  // fetch jars & transactions
  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/jars`, { headers: authHeader })
      .then(r => r.json())
      .then(data => {
        const arr = Object.values(data) as any
        setJars(arr)
      })
    fetch(`${API_URL}/transactions`, { headers: authHeader })
      .then(r => r.json())
      .then(data => {
        const arr = Object.values(data) as any
        setTransactions(arr)
      })
    fetch(`${API_URL}/points`, { headers: authHeader })
      .then(r => r.json())
      .then(data => setPoints(data.points))
  }, [token])

  const handleLogin = (endpoint: 'login' | 'register') => {
    fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token)
          setToken(data.access_token)
        } else {
          alert('Authentication error')
        }
      })
  }

  const handleAddTx = () => {
    if (!description || !amount) return
    fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ description, amount: Number(amount) })
    })
      .then(r => r.json())
      .then(tx => {
        setTransactions(t => [...t, tx])
        setDescription('')
        setAmount(0)
        // refresh jars and points
        fetch(`${API_URL}/jars`, { headers: authHeader })
          .then(r => r.json())
          .then(data => setJars(Object.values(data) as any))
        fetch(`${API_URL}/points`, { headers: authHeader })
          .then(r => r.json())
          .then(data => setPoints(data.points))
      })
  }

  const handleInsight = () => {
    fetch(`${API_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insightQuery)
    })
      .then(r => r.json())
      .then(res => setInsightAnswer(res.answer))
  }

  if (!token) {
    return (
      <div className="login-container">
        <h2>FinCoach VN</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => handleLogin('login')}>Login</button>
        <button onClick={() => handleLogin('register')}>Register</button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {username || 'User'}</h2>

      <section>
        <h3>Jar Balances</h3>
        <table>
          <thead>
            <tr>
              <th>Jar</th>
              <th>Allocation (%)</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {jars.map(j => (
              <tr key={j.id}>
                <td>{j.name}</td>
                <td>{j.allocation_percent.toFixed(0)}%</td>
                <td>{j.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Add Transaction</h3>
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        <button onClick={handleAddTx}>Add</button>
      </section>

      <section>
        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Jar</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td>{t.amount}</td>
                <td>{t.jar_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Wisdom Points: {points}</h3>
      </section>

      <section>
        <h3>Financial Insights</h3>
        <input placeholder="Ask a question..." value={insightQuery} onChange={e => setInsightQuery(e.target.value)} />
        <button onClick={handleInsight}>Get Insight</button>
        <p>{insightAnswer}</p>
      </section>
    </div>
  )
}

export default App
