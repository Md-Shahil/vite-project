import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Fetch initial data from the backend when the app loads
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Error loading data:', err));
  }, []);

  // Send new transaction to the backend
  const addTransaction = async () => {
    if (!description || !amount) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: Number(amount) }),
      });

      if (response.ok) {
        const newTx = await response.json();
        setTransactions((prev) => [newTx, ...prev]); // Add new transaction to UI state
        setDescription('');
        setAmount('');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  // Delete transaction from backend database
  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const totalBalance = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Personal Expense Tracker</h2>

      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: totalBalance >= 0 ? '#28a745' : '#dc3545' }}>
          Balance: ${totalBalance.toFixed(2)}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
          placeholder="Description"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
          placeholder="Amount (negative for expense)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={addTransaction}
          style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add
        </button>
      </div>

      <ul style={{ paddingLeft: '0', listStyle: 'none', marginTop: '20px' }}>
        {transactions.map((tx) => (
          <li
            key={tx.id}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: tx.amount < 0 ? '#dc3545' : '#28a745',
            }}
          >
            <span>{tx.description}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
              <button
                onClick={() => deleteTransaction(tx.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '16px' }}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;