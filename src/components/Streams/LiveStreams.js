import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  Person,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import StreamService from '../../services/StreamService';

const STREAMS_PER_PAGE = 6;

const LiveStreams = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('viewCount');
  const [gameFilter, setGameFilter] = useState('');
  const [visibleStreams, setVisibleStreams] = useState(STREAMS_PER_PAGE);
  const [popularGames] = useState([
    'CS:GO',
    'VALORANT',
    'League of Legends',
    'Dota 2',
    'PUBG',
    'Fortnite',
    'Call of Duty',
    'Apex Legends',
    'GTA V',
    'Minecraft'
  ]);

  const fetchStreams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StreamService.getLiveStreams(gameFilter || searchQuery);
      
      // Sort streams based on selected criteria
      const sortedStreams = [...response].sort((a, b) => {
        if (sortBy === 'viewCount') {
          return b.viewers - a.viewers;
        }
        return 0;
      });

      setStreams(sortedStreams);
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError('Failed to load streams. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [gameFilter, sortBy, searchQuery]);

  useEffect(() => {
    fetchStreams();
    // Refresh streams every 60 seconds
    const interval = setInterval(fetchStreams, 60000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStreams();
  };

  const handleGameFilter = (game) => {
    setGameFilter(game);
    setSearchQuery('');
    setVisibleStreams(STREAMS_PER_PAGE);
  };

  const handleShowMore = () => {
    setVisibleStreams(prev => prev + STREAMS_PER_PAGE);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchStreams();
  };

  const formatViewers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  const handleImageError = (e) => {
    e.target.src = '/assets/placeholder-stream.jpg';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Live Streams</Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="viewCount">Viewers (High to Low)</MenuItem>
                <MenuItem value="recent">Recently Started</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Game Filter</InputLabel>
              <Select
                value={gameFilter}
                label="Game Filter"
                onChange={(e) => handleGameFilter(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="">All Games</MenuItem>
                {popularGames.map((game) => (
                  <MenuItem key={game} value={game}>
                    {game}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Streams Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {streams.slice(0, visibleStreams).map((stream) => (
              <Grid item xs={12} sm={6} md={4} key={stream.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={stream.thumbnail}
                      alt={stream.title}
                      onError={handleImageError}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'error.main',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="white">
                        LIVE
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={stream.avatar} 
                        sx={{ mr: 1 }}
                        onError={handleImageError}
                      />
                      <Tooltip title={stream.streamer}>
                        <Typography variant="subtitle1" noWrap>
                          {stream.streamer}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Tooltip title={stream.title}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {stream.title}
                      </Typography>
                    </Tooltip>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={<Person />}
                        label={stream.game}
                        size="small"
                        color="primary"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {formatViewers(stream.viewers)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      href={stream.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch Stream
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Show More Button */}
          {streams.length > visibleStreams && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleShowMore}
                endIcon={<ExpandMoreIcon />}
                size="large"
              >
                Show More
              </Button>
            </Box>
          )}

          {/* No Results Message */}
          {!loading && streams.length === 0 && (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No streams found. Try different search terms or filters.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default LiveStreams;
