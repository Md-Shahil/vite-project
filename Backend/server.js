import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Transaction Schema & Model
const transactionSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Transform internal _id to id for frontend compatibility
transactionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// API Routes

// 1. Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching transactions' });
  }
});

// 2. Add a new transaction
app.post('/api/transactions', async (req, res) => {
  const { description, amount } = req.body;

  if (!description || amount === undefined) {
    return res.status(400).json({ error: 'Please provide description and amount' });
  }

  try {
    const newTransaction = new Transaction({ description, amount: Number(amount) });
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error while saving transaction' });
  }
});

// 3. Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error while deleting transaction' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

