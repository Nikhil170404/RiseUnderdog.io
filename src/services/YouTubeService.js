import axios from 'axios';

const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  static async getLiveStreams(gameId = '', maxResults = 50, pageToken = '') {
    try {
      const params = {
        part: 'snippet,liveStreamingDetails',
        eventType: 'live',
        type: 'video',
        maxResults,
        key: YOUTUBE_API_KEY,
        videoCategoryId: '20', // Gaming category
        order: 'viewCount',
        regionCode: 'US', // Add region code for better results
      };

      if (gameId) {
        params.q = `${gameId} gameplay live`;
      } else {
        params.q = 'gaming live';
      }

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await axios.get(`${YOUTUBE_API_URL}/search`, { params });
      
      // Filter out non-live streams
      response.data.items = response.data.items.filter(item => 
        item.snippet.liveBroadcastContent === 'live'
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  static async getStreamDetails(videoId) {
    try {
      const params = {
        part: 'snippet,liveStreamingDetails,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      };

      const response = await axios.get(`${YOUTUBE_API_URL}/videos`, { params });
      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching stream details:', error);
      throw error;
    }
  }

  static async getPopularGames() {
    try {
      const params = {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '20',
        maxResults: 50,
        key: YOUTUBE_API_KEY,
      };

      const response = await axios.get(`${YOUTUBE_API_URL}/videos`, { params });
      
      // Extract unique game names from video titles
      const gameNames = new Set();
      response.data.items.forEach(item => {
        const title = item.snippet.title;
        const possibleGame = title.split(/[-|:]/)[0].trim();
        if (possibleGame && possibleGame.length < 30) { // Filter out long strings
          gameNames.add(possibleGame);
        }
      });

      return Array.from(gameNames);
    } catch (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }
  }
}

export default YouTubeService;
