import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Remove,
  ContentCopy,
} from '@mui/icons-material';
import { fetchWallet } from '../../redux/actions/walletAction';
import { db, collection, doc, getDoc, setDoc, serverTimestamp, updateDoc } from '../../firebase';

const bankDetails = {
  accountName: "Your Company Name",
  accountNumber: "1234567890",
  ifscCode: "BANK0123456",
  bankName: "Your Bank Name",
  branch: "Your Branch Name",
  upiId: "yourcompany@upi"
};

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [transactions, setTransactions] = useState([]);
  const [userBanks, setUserBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [newBank, setNewBank] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wallet = useSelector((state) => state.wallet);

  const fetchUserData = useCallback(async () => {
    try {
      const walletRef = doc(db, 'wallets', user.uid);
      const walletDoc = await getDoc(walletRef);
      
      if (!walletDoc.exists()) {
        await setDoc(walletRef, {
          userId: user.uid,
          balance: 0,
          transactions: [],
          banks: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setTransactions([]);
        setUserBanks([]);
      } else {
        const data = walletDoc.data();
        setTransactions(data.transactions || []);
        setUserBanks(data.banks || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching user data',
        severity: 'error'
      });
    }
  }, [user.uid]);

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
      fetchUserData();
    }
  }, [user, dispatch, fetchUserData]);

  const handleOpenDepositDialog = () => {
    setOpenDialog(true);
  };

  const handleOpenWithdrawDialog = () => {
    setOpenWithdrawDialog(true);
  };

  const handleOpenBankDialog = () => {
    setOpenBankDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenWithdrawDialog(false);
    setOpenBankDialog(false);
    setAmount('');
    setTransactionId('');
    setNewBank({
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: '',
    });
  };

  const handleAddBank = async () => {
    if (!user) return;

    try {
      const walletRef = doc(db, 'wallets', user.uid);
      const newBankWithId = {
        ...newBank,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
        status: 'active'
      };

      await updateDoc(walletRef, {
        banks: [...userBanks, newBankWithId],
        updatedAt: serverTimestamp()
      });

      setUserBanks([...userBanks, newBankWithId]);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Bank account added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding bank account:', error);
      setSnackbar({
        open: true,
        message: 'Error adding bank account',
        severity: 'error'
      });
    }
  };

  const handleWithdraw = async () => {
    if (!user || !selectedBank || amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter valid amount and select a bank account',
        severity: 'error'
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > wallet.balance) {
      setSnackbar({
        open: true,
        message: 'Insufficient balance',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const withdrawalRef = doc(collection(db, 'withdrawalRequests'));
      const selectedBankDetails = userBanks.find(bank => bank.id === selectedBank);
      const requestId = withdrawalRef.id;

      await setDoc(withdrawalRef, {
        requestId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        amount: withdrawAmount,
        bankDetails: selectedBankDetails,
        status: 'pending',
        createdAt: serverTimestamp(),
        processedAt: null,
        processedBy: null,
        remarks: '',
      });

      const walletRef = doc(db, 'wallets', user.uid);
      await updateDoc(walletRef, {
        transactions: [{
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
          requestId,
          bankDetails: {
            bankName: selectedBankDetails.bankName,
            accountNumber: selectedBankDetails.accountNumber,
          },
          timestamp: new Date().toISOString(),
        }, ...transactions],
        updatedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Withdrawal request submitted successfully! It will be processed within 24 hours.',
        severity: 'success',
      });

      handleCloseDialog();
      fetchUserData();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting withdrawal request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!user || amount <= 0 || !transactionId) {
      setSnackbar({
        open: true,
        message: 'Please enter valid amount and transaction ID',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const transactionAmount = parseFloat(amount);
      if (isNaN(transactionAmount)) {
        throw new Error('Invalid amount');
      }

      const depositRequestRef = doc(collection(db, 'depositRequests'));
      await setDoc(depositRequestRef, {
        userId: user.uid,
        userEmail: user.email,
        amount: transactionAmount,
        transactionId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Deposit request submitted successfully! Admin will verify and add the amount.',
        severity: 'success',
      });

      handleCloseDialog();
      fetchUserData();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting deposit request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return !isNaN(amount) ? parseFloat(amount).toFixed(2) : '0.00';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <div>
                  <Typography variant="h6">Wallet Balance</Typography>
                  <Typography variant="h4">₹{formatAmount(wallet.balance)}</Typography>
                </div>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleOpenDepositDialog}
                    startIcon={<Add />}
                    color="primary"
                  >
                    Deposit
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleOpenWithdrawDialog}
                    startIcon={<Remove />}
                    color="secondary"
                  >
                    Withdraw
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Accounts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your Bank Accounts</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleOpenBankDialog}
                >
                  Add Bank
                </Button>
              </Box>
              {userBanks.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bank Name</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>IFSC Code</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userBanks.map((bank) => (
                        <TableRow key={bank.id}>
                          <TableCell>{bank.bankName}</TableCell>
                          <TableCell>{bank.accountNumber}</TableCell>
                          <TableCell>{bank.ifscCode}</TableCell>
                          <TableCell>{bank.branch}</TableCell>
                          <TableCell>
                            <Chip
                              label={bank.status}
                              color={bank.status === 'active' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No bank accounts added yet</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={transaction.id || index}>
                        <TableCell>{formatDate(transaction.timestamp || transaction.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            color={transaction.type === 'deposit' ? 'success' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{formatAmount(transaction.amount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={
                              transaction.status === 'completed' ? 'success' :
                              transaction.status === 'pending' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.bankDetails ? 
                            `${transaction.bankDetails.bankName} - ${transaction.bankDetails.accountNumber}` :
                            transaction.details || '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Money</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Bank Account Details for Deposit
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Account Name
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{bankDetails.accountName}</Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(bankDetails.accountName)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Account Number
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{bankDetails.accountNumber}</Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(bankDetails.accountNumber)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  IFSC Code
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{bankDetails.ifscCode}</Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(bankDetails.ifscCode)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  UPI ID
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{bankDetails.upiId}</Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(bankDetails.upiId)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Enter Deposit Details
            </Typography>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <Typography>₹</Typography>,
              }}
            />
            <TextField
              fullWidth
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              margin="normal"
              helperText="Enter the transaction ID from your bank transfer"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitDeposit}
            variant="contained"
            disabled={loading || !amount || !transactionId}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={openWithdrawDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Money</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Bank Account</InputLabel>
              <Select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                label="Select Bank Account"
              >
                {userBanks.map((bank) => (
                  <MenuItem key={bank.id} value={bank.id}>
                    {bank.bankName} - {bank.accountNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <Typography>₹</Typography>,
              }}
            />
            {wallet.balance > 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Available Balance: ₹{formatAmount(wallet.balance)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={loading || !amount || !selectedBank}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Dialog */}
      <Dialog open={openBankDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Account Holder Name"
              value={newBank.accountName}
              onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Account Number"
              value={newBank.accountNumber}
              onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="IFSC Code"
              value={newBank.ifscCode}
              onChange={(e) => setNewBank({ ...newBank, ifscCode: e.target.value.toUpperCase() })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bank Name"
              value={newBank.bankName}
              onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Branch Name"
              value={newBank.branch}
              onChange={(e) => setNewBank({ ...newBank, branch: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddBank}
            variant="contained"
            disabled={loading || !newBank.accountName || !newBank.accountNumber || !newBank.ifscCode || !newBank.bankName || !newBank.branch}
          >
            Add Bank Account
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Wallet;
