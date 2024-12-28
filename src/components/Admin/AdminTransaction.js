import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Box,
  Chip,
  TablePagination,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { db, collection, query, where, getDocs, orderBy } from '../../firebase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminTransaction = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // eslint-disable-next-line no-unused-vars
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    type: 'all',
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    pendingAmount: 0,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const startDateTime = new Date(filters.startDate);
      const endDateTime = new Date(filters.endDate);
      endDateTime.setHours(23, 59, 59, 999);

      let q = query(
        collection(db, 'transactions'),
        where('date', '>=', startDateTime),
        where('date', '<=', endDateTime),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let allTransactions = [];
      let totalRevenue = 0;
      let pendingAmount = 0;

      querySnapshot.forEach((doc) => {
        const transaction = { id: doc.id, ...doc.data() };
        
        if (
          (filters.status === 'all' || transaction.status === filters.status) &&
          (filters.type === 'all' || transaction.type === filters.type)
        ) {
          allTransactions.push(transaction);
          if (transaction.status === 'completed') {
            totalRevenue += transaction.amount;
          } else if (transaction.status === 'pending') {
            pendingAmount += transaction.amount;
          }
        }
      });

      setStats({
        totalRevenue,
        totalTransactions: allTransactions.length,
        avgTransactionValue: totalRevenue / allTransactions.length || 0,
        pendingAmount,
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const chartData = useMemo(() => {
    const dailyRevenue = {};
    const dailyTransactions = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date.toDate()).toISOString().split('T')[0];
      if (transaction.status === 'completed') {
        dailyRevenue[date] = (dailyRevenue[date] || 0) + transaction.amount;
        dailyTransactions[date] = (dailyTransactions[date] || 0) + 1;
      }
    });

    const labels = Object.keys(dailyRevenue).sort();

    return {
      revenue: {
        labels,
        datasets: [
          {
            label: 'Daily Revenue',
            data: labels.map(date => dailyRevenue[date]),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      transactions: {
        labels,
        datasets: [
          {
            label: 'Daily Transactions',
            data: labels.map(date => dailyTransactions[date]),
            backgroundColor: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.dark,
            borderWidth: 1,
          },
        ],
      },
    };
  }, [transactions, theme.palette]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const renderStatCard = (title, value, isAmount = true) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card 
        elevation={3}
        sx={{
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent>
          <Typography color="textSecondary" gutterBottom variant="subtitle2">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="80%" height={40} />
          ) : (
            <Typography variant="h5" component="div">
              {isAmount ? `₹${value.toFixed(2)}` : value}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderMobileTableRow = (transaction) => (
    <TableRow key={transaction.id}>
      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2">
            {new Date(transaction.date.toDate()).toLocaleDateString()}
          </Typography>
          <Chip
            label={transaction.type}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Typography variant="h6">₹{transaction.amount}</Typography>
          <Chip
            label={transaction.status}
            size="small"
            color={getStatusColor(transaction.status)}
            sx={{ alignSelf: 'flex-start' }}
          />
          <Typography variant="caption" color="textSecondary">
            {transaction.userId}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {renderStatCard('Total Revenue', stats.totalRevenue)}
            {renderStatCard('Total Transactions', stats.totalTransactions, false)}
            {renderStatCard('Average Value', stats.avgTransactionValue)}
            {renderStatCard('Pending Amount', stats.pendingAmount)}
          </Grid>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Start Date
                </Typography>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  End Date
                </Typography>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <select
                  fullWidth
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Type
                </Typography>
                <select
                  fullWidth
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="tournament_fee">Tournament Fee</option>
                  <option value="prize">Prize Money</option>
                </select>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2,
              height: isMobile ? 300 : 400,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <Line data={chartData.revenue} options={chartOptions} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2,
              height: isMobile ? 300 : 400,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Transaction Volume
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <Bar data={chartData.transactions} options={chartOptions} />
            )}
          </Paper>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              width: '100%',
              mb: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <TableContainer>
              <Table>
                {!isMobile && (
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {loading ? (
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={isMobile ? 1 : 6}>
                          <Skeleton variant="rectangular" height={isMobile ? 120 : 40} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    transactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction) => (
                        isMobile ? (
                          renderMobileTableRow(transaction)
                        ) : (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.date.toDate()).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.type}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>₹{transaction.amount}</TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.status}
                                size="small"
                                color={getStatusColor(transaction.status)}
                              />
                            </TableCell>
                            <TableCell>{transaction.userId}</TableCell>
                            <TableCell>{transaction.details}</TableCell>
                          </TableRow>
                        )
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminTransaction;
