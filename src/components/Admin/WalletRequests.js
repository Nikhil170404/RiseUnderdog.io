import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { db, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from '../../firebase';
import AdminLayout from './AdminLayout';

const WalletRequests = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requestsRef = collection(db, activeTab === 0 ? 'withdrawalRequests' : 'depositRequests');
      const q = query(requestsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setRequests(requestsData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (request, action) => {
    setSelectedRequest({ ...request, action });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setOpenDialog(false);
    setRemarks('');
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      const { id, userId, amount, action } = selectedRequest;
      const isApproved = action === 'approve';

      // Update request status
      const requestRef = doc(db, activeTab === 0 ? 'withdrawalRequests' : 'depositRequests', id);
      await updateDoc(requestRef, {
        status: isApproved ? 'approved' : 'rejected',
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser.uid,
        remarks: remarks,
      });

      // Update user's wallet balance if approved
      if (isApproved) {
        const walletRef = doc(db, 'wallets', userId);
        const walletDoc = await getDoc(walletRef);
        
        if (walletDoc.exists()) {
          const currentBalance = walletDoc.data().balance || 0;
          const newBalance = activeTab === 0 
            ? currentBalance - amount // Withdrawal
            : currentBalance + amount; // Deposit

          await updateDoc(walletRef, {
            balance: newBalance,
            updatedAt: serverTimestamp(),
            transactions: [{
              type: activeTab === 0 ? 'withdrawal' : 'deposit',
              amount: amount,
              status: 'completed',
              requestId: id,
              timestamp: new Date().toISOString(),
              remarks: remarks,
            }, ...walletDoc.data().transactions],
          });
        }
      }

      handleCloseDialog();
      fetchRequests();
      
    } catch (error) {
      console.error('Error processing request:', error);
      setError('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <WalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Wallet Requests
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Withdrawal Requests" />
            <Tab label="Deposit Requests" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No pending requests
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.requestId || request.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{request.userName || 'N/A'}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.userEmail}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatAmount(request.amount)}</TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
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
                          <Button
                            startIcon={<ApproveIcon />}
                            color="success"
                            size="small"
                            onClick={() => handleOpenDialog(request, 'approve')}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            startIcon={<RejectIcon />}
                            color="error"
                            size="small"
                            onClick={() => handleOpenDialog(request, 'reject')}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedRequest?.action === 'approve' ? 'Approve' : 'Reject'} Request
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Remarks"
                multiline
                rows={4}
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any remarks or notes..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleProcessRequest}
              color={selectedRequest?.action === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {selectedRequest?.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default WalletRequests;
