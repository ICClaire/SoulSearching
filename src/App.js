import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import LoginButton from './components/LoginButton'
import LogOut from './components/LogOut';


const App = () => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userTracks, setUserTracks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);
  const [recommendedTracks, setRecommendedTracks] = useState([]);


  ///////////////////////////// useEffect Function /////////////////////////////
  //useEffect basically means run ONCE on render
  useEffect(() => {

    localStorage.clear()
    console.log("CLEAR STORAGED", localStorage.getItem('access_token1'))
    
    const parsed = queryString.parse(window.location.search);
    const accessToken1 = parsed.access_token1;
    const refreshToken1 = parsed.refresh_token1;

    if (accessToken1 || refreshToken1) {
      setToken(accessToken1 || refreshToken1);
      localStorage.setItem('access_token1', accessToken1);
      localStorage.setItem('refresh_token1', refreshToken1);
      // window.location.hash = ''; 

      fetchUserData(accessToken1, refreshToken1);
      fetchUserSavedTracks(accessToken1, refreshToken1);
      fetchRecommendedTracks(accessToken1, refreshToken1);
      createPlaylistWithRecommendations (accessToken1, refreshToken1);

    } else  {
      localStorage.clear()
    }

  }, []);

  ///////////////////////////// Fetch Functions /////////////////////////////

  //// This fetches the profile data!
  // passing in the access tokens
  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      // setUserId = data.id;
      setUserData(data);
      setUserId = (data.id);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  //// This fetches the user's top tracks
  const fetchUserSavedTracks = async(accessToken) =>{
    try{
      const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
      if (!response.ok){
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      // This has a condition to check if the user has any top tracks
      // if not, it will return an empty array
      // if the user has top tracks, it will return the top tracks
      // the empty array prevents the app from crashing!
      setUserTracks(data.items || []);

      // Need to get the id of the user's top tracks
      // the map method is used to get the id
      fetchRecommendedTracks(accessToken, data.items.map(track => track.id));
      console.log(fetchRecommendedTracks);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    // console.log(userTracks)
  };

  // ?? This function is not working
  //// This fetches the recommended tracks
  // Two parameters needed for this function
  // accessToken and userTracks
  // userTracks is an array of the user's top tracks
  const fetchRecommendedTracks = async (accessToken, userTracks) => {
    try {
      const seedTracks = userTracks.join(',');
      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=${seedTracks}`, 
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }
      );
      console.log(response)
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendedTracks(data.tracks || []);
      // setTracksUri(data.tracks.map(track => track.uri));
    } catch (error) {
      console.error('Error fetching recommended tracks:', error);
      
    }
  };


// Creating the spotify playlist

const tracksUri = recommendedTracks.map(track => track.uri);

const createPlaylistWithRecommendations = async (accessToken, tracksUri, userId) => {
  try {
      const response = await fetch('https://api.spotify.com/v1/users/${userId}/playlists',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'SoulSearching Playlist',
          description: 'Your recommended tracks from SoulSearching',
          public: false
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const data = await response.json();
      const newPlaylistId = data.id;
      setPlaylistId(newPlaylistId);

      const tracksUri = recommendedTracks.map(track => track.uri);
      const addTracks = await fetch(`https://api.spotify.com/v1/playlists/${setPlaylistId}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: tracksUri
        })
      });
      if (!addTracks.ok) {
        throw new Error('Failed to add tracks to playlist');
      }
      console.log('Playlist created successfully');
      console.log(createPlaylistWithRecommendations)
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };
  
  const handleCreatePlaylist = () => {
    createPlaylistWithRecommendations();
    console.log('successful')
  };
  



  ///////////////////////////// Handle Logout Function /////////////////////////////
  const handleLogout = () => {
    console.log("logout clicked")
    localStorage.clear();
    setToken(null);
    setUserData(null);
    setUserTracks([]);
    setRecommendedTracks([]);
    window.location.href = 'http://localhost:3000'; // Redirect to the login page or home page
  };
  

  
  return (
    <div>
      

      {token ? (
        <div>
        {(userData && userTracks) && (
          <div>
            <div className='container-1 text-white p-10 flex flex-row justify-between align-middle' >
              <div className='intro'>
                <h1 className='text-3xl font-sans font-semibold '> Welcome to SoulSearching {userData.display_name}</h1>
                <p className='font-sans font-light text-lg pt-1'> A website to help build your personalized playlist using Spotify API </p>
              </div>
              <div className='user-info flex flex-row align-middle'>
                <img src={userData.images[0].url} alt="User Profile" className='w-10 h-10 mr-2 rounded-full' />
                <button className='font-sans font-semibold rounded-full bg-blue-600 w-20 h-10 ' onClick={handleLogout}>logout</button>
              </div>
            </div>
            <div className='container-2 p-10 flex flex-row justify-between'>
              <div className='user-profile flex flex-col flex-wrap w-2/4'>
                <h1 className='text-2xl font-sans font-semibold text-white pb-3 text-left'>Your Top Tracks</h1>
                <div className='top-tracks flex flex-row flex-wrap'>
                {userTracks.map((track) => (
                    <div key={track.id} className='bg-black bg-opacity-60 m-4 w-56 flex flex-col align-middle justify-center text-center p-4 rounded-md text-white '>
                        {track.album.images && track.album.images[0] && (
                          <img className='w-full'src={track.album.images[0].url} alt="album cover" />
                        )}
                        <h3 className='pt-3 pb-5 font-semibold'>{track.name}</h3>
                        <p>{track.artists.map(artist => artist.name)}</p>
                  </div>
                    ))}
                </div>
              </div>
              <div className='suggested-playlist'>
                  
                <h2 className='text-2xl font-sans font-semibold text-white pb-3 text-left'>Recommended Tracks</h2>
                  {recommendedTracks.map((track) => (
                        <div key={track.id}>
                          <h3 clas>{track.name}</h3>
                          <p>{track.artists.map(artist => artist.name)}</p>
                          {track.album.images && track.album.images[0] && (
                            <img src={track.album.images[0].url} alt="album cover" />
                          )}
                    </div>
                  ))}
                   <button className='mt-4 p-2 bg-green-600 text-white rounded' onClick={handleCreatePlaylist}>
                    Create Playlist with Recommended Tracks
                  </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
      ) : (
        <div>
          <h1>LOGIN</h1>
          <LoginButton />
          {/* <LogOut onClick={handleLogout}/> */}
          <button onClick={handleLogout}>logout</button>
          
        </div>
      )}
    </div>
  );
};

export default App;
