import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './TwitchConfig';

class StreamService {
  static accessToken = null;
  static tokenExpiry = null;

  static async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to get Twitch access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Twitch access token:', error);
      throw error;
    }
  }

  static async getLiveStreams(gameFilter = '') {
    try {
      const accessToken = await this.getAccessToken();
      
      // First get game IDs if a game filter is provided
      let gameId = '';
      if (gameFilter) {
        const gameResponse = await fetch(`https://api.twitch.tv/helix/games?name=${encodeURIComponent(gameFilter)}`, {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!gameResponse.ok) {
          throw new Error('Failed to fetch game data from Twitch');
        }
        
        const gameData = await gameResponse.json();
        if (gameData.data.length > 0) {
          gameId = gameData.data[0].id;
        }
      }

      // Fetch streams
      let url = 'https://api.twitch.tv/helix/streams?first=100';
      if (gameId) {
        url += `&game_id=${gameId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streams from Twitch');
      }

      const data = await response.json();
      
      // Transform the data to match our application's format
      return data.data.map(stream => ({
        id: stream.id,
        title: stream.title,
        streamer: stream.user_name,
        thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
        game: stream.game_name,
        viewers: stream.viewer_count,
        avatar: '', // We'll fetch this separately
        platform: 'Twitch',
        url: `https://www.twitch.tv/${stream.user_login}`
      }));
    } catch (error) {
      console.error('Error fetching live streams:', error);
      // Return empty array instead of throwing to handle errors gracefully
      return [];
    }
  }

  static async getStreamerAvatar(userId) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`https://api.twitch.tv/helix/users?id=${userId}`, {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data from Twitch');
      }

      const data = await response.json();
      return data.data[0]?.profile_image_url || '/assets/thumbnails/placeholder.jpg';
    } catch (error) {
      console.error('Error fetching streamer avatar:', error);
      return '/assets/thumbnails/placeholder.jpg';
    }
  }
}

export default StreamService;
