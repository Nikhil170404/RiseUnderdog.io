import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, collection, getDocs, doc, getDoc, updateDoc } from '../../firebase';

// Thunks
export const fetchWalletsThunk = createAsyncThunk(
  'transactions/fetchWallets',
  async () => {
    const walletsRef = collection(db, 'wallets');
    const snapshot = await getDocs(walletsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);

export const addMoneyThunk = createAsyncThunk(
  'transactions/addMoney',
  async ({ userId, amount }) => {
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(walletSnap.data().balance) || 0;
    const newBalance = currentBalance + amount;

    await updateDoc(walletRef, { balance: newBalance });

    return { userId, newBalance };
  }
);

// Slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    wallets: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWalletsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.wallets = action.payload;
      })
      .addCase(fetchWalletsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addMoneyThunk.fulfilled, (state, action) => {
        const index = state.wallets.findIndex(wallet => wallet.id === action.payload.userId);
        if (index !== -1) {
          state.wallets[index].balance = action.payload.newBalance;
        }
      })
      .addCase(addMoneyThunk.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export default transactionSlice.reducer;
