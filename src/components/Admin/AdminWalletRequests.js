import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Box,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { db, doc, collection, query, onSnapshot, updateDoc, serverTimestamp, getDoc, setDoc, orderBy } from '../../firebase';
import NotificationService from '../../services/NotificationService';

const AdminWalletRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTab, setCurrentTab] = useState('deposits');

  useEffect(() => {
    const collectionName = currentTab === 'deposits' ? 'depositRequests' : 'withdrawalRequests';
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching requests:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching requests',
        severity: 'error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentTab]);

  const handleApprove = async (request) => {
    try {
      setLoading(true);
      const collectionName = currentTab === 'deposits' ? 'depositRequests' : 'withdrawalRequests';
      
      // Update request status
      const requestRef = doc(db, collectionName, request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      // Get or create user's wallet
      const walletRef = doc(db, 'wallets', request.userId);
      const walletDoc = await getDoc(walletRef);
      
      const newTransaction = {
        amount: Number(request.amount) || 0,
        type: currentTab === 'deposits' ? 'deposit' : 'withdrawal',
        status: 'approved',
        date: new Date(),
        details: `${currentTab === 'deposits' ? 'Deposit' : 'Withdrawal'} request approved`,
        transactionId: request.transactionId || '',
      };

      if (!walletDoc.exists()) {
        await setDoc(walletRef, {
          userId: request.userId,
          balance: currentTab === 'deposits' ? Number(request.amount) || 0 : 0,
          transactions: [newTransaction],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const currentBalance = Number(walletDoc.data().balance) || 0;
        const newBalance = currentTab === 'deposits' 
          ? currentBalance + (Number(request.amount) || 0)
          : currentBalance - (Number(request.amount) || 0);

        await updateDoc(walletRef, {
          balance: newBalance,
          transactions: [...(walletDoc.data().transactions || []), newTransaction],
          updatedAt: serverTimestamp(),
        });
      }

      // Send notification
      await NotificationService.sendWalletNotification(
        request.userId,
        currentTab === 'deposits' ? 'deposit' : 'withdrawal',
        request.amount,
        'approved'
      );

      setSnackbar({
        open: true,
        message: `${currentTab === 'deposits' ? 'Deposit' : 'Withdrawal'} request approved successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      setSnackbar({
        open: true,
        message: 'Error approving request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (request) => {
    try {
      setLoading(true);
      const collectionName = currentTab === 'deposits' ? 'depositRequests' : 'withdrawalRequests';
      
      // Update request status
      const requestRef = doc(db, collectionName, request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: serverTimestamp(),
      });

      // Send notification
      await NotificationService.sendWalletNotification(
        request.userId,
        currentTab === 'deposits' ? 'deposit' : 'withdrawal',
        request.amount,
        'rejected'
      );

      setSnackbar({
        open: true,
        message: `${currentTab === 'deposits' ? 'Deposit' : 'Withdrawal'} request rejected`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      setSnackbar({
        open: true,
        message: 'Error rejecting request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Wallet Requests
          </Typography>
          
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab value="deposits" label="Deposit Requests" />
            <Tab value="withdrawals" label="Withdrawal Requests" />
          </Tabs>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.userId}</TableCell>
                    <TableCell>${Number(request.amount).toFixed(2)}</TableCell>
                    <TableCell>{request.transactionId || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'approved'
                            ? 'success'
                            : request.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.createdAt?.toDate
                        ? new Date(request.createdAt.toDate()).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(request)}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => handleReject(request)}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No {currentTab} requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminWalletRequests;
