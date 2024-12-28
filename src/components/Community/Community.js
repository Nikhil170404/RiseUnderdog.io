import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  Comment,
  Share,
  MoreVert,
  Send,
  Image as ImageIcon,
  EmojiEvents,
  SportsEsports,
  Group,
  Bookmark,
  BookmarkBorder,
  Forum,
  LocalFireDepartment,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import { db, storage, auth } from '../../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  where,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { v4 as uuidv4 } from 'uuid';

const Community = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState('feed');
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    setLoading(true);
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
      setLoading(false);
    });

    const trendingPostsRef = collection(db, 'trendingPosts');
    const trendingQ = query(trendingPostsRef, orderBy('timestamp', 'desc'));
    const unsubscribeTrending = onSnapshot(trendingQ, (snapshot) => {
      const trendingPostList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrendingPosts(trendingPostList);
    });

    const challengeRef = collection(db, 'dailyChallenges');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const challengeQuery = query(
      challengeRef,
      where('date', '>=', today),
      limit(1)
    );
    const unsubscribeChallenge = onSnapshot(challengeQuery, (snapshot) => {
      if (!snapshot.empty) {
        setDailyChallenge(snapshot.docs[0].data());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTrending();
      unsubscribeChallenge();
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText.trim() && !selectedImage) return;

    setLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        const imageRef = ref(storage, `posts/${uuidv4()}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        text: postText,
        userId: user.uid,
        userName: user.displayName,
        timestamp: Timestamp.now(),
        imageUrl,
        likes: [],
        comments: {},
        kudos: 0
      });
      setPostText('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const postRef = doc(db, 'posts', selectedPost.id);
      await updateDoc(postRef, {
        comments: {
          ...selectedPost.comments,
          [uuidv4()]: {
            userName: user.displayName,
            text: commentText,
            timestamp: Timestamp.now()
          }
        }
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setAnchorEl(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, reaction) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const currentReactions = post.reactions || {};
      
      if (currentReactions[user.uid] === reaction) {
        await updateDoc(postRef, {
          [`reactions.${user.uid}`]: null
        });
      } else {
        await updateDoc(postRef, {
          [`reactions.${user.uid}`]: reaction
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleShare = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        shares: (posts.find(p => p.id === postId).shares || 0) + 1
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      if (bookmarkedPosts.includes(postId)) {
        setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId));
        await updateDoc(userRef, {
          bookmarkedPosts: bookmarkedPosts.filter(id => id !== postId)
        });
      } else {
        setBookmarkedPosts([...bookmarkedPosts, postId]);
        await updateDoc(userRef, {
          bookmarkedPosts: [...bookmarkedPosts, postId]
        });
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const renderPost = (post) => (
    <Card key={post.id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={post.userAvatar}
              alt={post.userName}
              sx={{
                width: 48,
                height: 48,
                border: '2px solid gold'
              }}
            />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.userName}
              </Typography>
            </Box>
          </Box>
          {post.userId === user.uid && (
            <IconButton onClick={(e) => {
              setSelectedPost(post);
              setAnchorEl(e.currentTarget);
            }}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.text}
        </Typography>

        {post.imageUrl && (
          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
            <img
              src={post.imageUrl}
              alt="Post content"
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {post.tags?.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            size="small"
            label={post.category}
            color="primary"
            icon={
              post.category === 'tournaments' ? <EmojiEvents /> :
              post.category === 'teams' ? <Group /> :
              post.category === 'gaming' ? <SportsEsports /> : null
            }
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['👍', '❤️', '🎮', '🏆', '😮'].map((reaction) => (
            <IconButton
              key={reaction}
              size="small"
              onClick={() => handleReaction(post.id, reaction)}
              color={post.reactions?.[user.uid] === reaction ? 'primary' : 'default'}
              disabled={loading}
            >
              {reaction}
            </IconButton>
          ))}
        </Box>
        <Button
          size="small"
          startIcon={<Comment />}
          onClick={() => setSelectedPost(post)}
          disabled={loading}
        >
          {post.comments ? Object.keys(post.comments).length : 0}
        </Button>
        <Button
          size="small"
          startIcon={<Share />}
          onClick={() => handleShare(post.id)}
          disabled={loading}
        >
          {post.shares}
        </Button>
        <IconButton
          size="small"
          onClick={() => handleBookmark(post.id)}
          disabled={loading}
          sx={{ ml: 'auto' }}
        >
          {bookmarkedPosts.includes(post.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Forum />}
            label="Feed"
            value="feed"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<LocalFireDepartment />}
            label="Trending"
            value="trending"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<EmojiEventsOutlined />}
            label="Challenges"
            value="challenges"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>

        {currentTab === 'feed' && (
          <>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your gaming moments..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-input"
                  disabled={loading}
                />
                <label htmlFor="image-input">
                  <IconButton component="span" color="primary" disabled={loading}>
                    <ImageIcon />
                  </IconButton>
                </label>
                <Button
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  onClick={handlePostSubmit}
                  disabled={(!postText.trim() && !selectedImage) || loading}
                >
                  Post
                </Button>
              </Box>
            </Box>
            {posts.map((post) => renderPost(post))}
          </>
        )}

        {currentTab === 'trending' && (
          <Box sx={{ p: 2 }}>
            {trendingPosts.map((post) => renderPost(post))}
          </Box>
        )}

        {currentTab === 'challenges' && (
          <Box sx={{ p: 2 }}>
            {dailyChallenge && (
              <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #16213e 30%, #1a1a2e 90%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalFireDepartment color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6">{dailyChallenge.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dailyChallenge.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<EmojiEventsOutlined />}
                      label={`${dailyChallenge.xpReward} XP`}
                      color="primary"
                      variant="outlined"
                    />
                    <Box 
                      sx={{ 
                        flexGrow: 1, 
                        height: 8, 
                        borderRadius: 4, 
                        bgcolor: 'rgba(0, 255, 157, 0.1)',
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${(dailyChallenge.progress || 0) * 100}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: 'linear-gradient(45deg, #00ff9d, #00b8d4)'
                        }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPost && (
          <>
            <DialogTitle>Comments</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                {selectedPost.comments?.map((comment) => (
                  <Box key={comment.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar src={comment.userAvatar} sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">{comment.userName}</Typography>
                    </Box>
                    <Typography variant="body2">{comment.text}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="contained"
                  onClick={handleComment}
                  disabled={!commentText.trim() || loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Send'}
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={() => setSelectedPost(null)} color="primary">
                  Close
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => handleDeletePost(selectedPost.id)}
          sx={{ color: 'error.main' }}
          disabled={loading}
        >
          Delete Post
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Community;
