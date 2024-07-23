import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import LoginButton from './components/LoginButton'
import LogOut from './components/LogOut';


const App = () => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userTracks, setUserTracks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  localStorage.setItem("userId1",userId)

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
      fetchUserSavedTracks(accessToken1);

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

      setUserData(data);
      setUserId(data.id);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  ///////////////////////////// Fetch User Saved Tracks Function /////////////////////////////

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
      // console.log(fetchRecommendedTracks);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    // console.log(userTracks)
  };

  ///////////////////////////// Fetch Recommended Tracks Function /////////////////////////////

  //// This fetches the recommended tracks
  // Two parameters needed for this function
  // accessToken and userTracks
  // userTracks is an array of the user's top tracks
  const fetchRecommendedTracks = async (accessToken, userTracks) => {
    try {
      const seedTracks = userTracks.join(',');
      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=${seedTracks}`, 
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }
      );
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


///////////////////////////// Create Playlist with Recommendations Function /////////////////////////////

// Creating the spotify playlist with the recommendation
const createPlaylistWithRecommendations = async () => {
  try {

    //local storage get for accesstoken because idk how to get from parameters
      const accessToken1 = localStorage.getItem('access_token1');
    
      // passed the endpoint with the userId
      // this will help create the playlist
      const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken1,
          'Content-Type': 'application/json'
        },
        // This is the body of the request which will help add the names, description and the public status of the playlist
        // The value of the body is a stringified JSON object because the body of the request must be in JSON format
        body: JSON.stringify({
          name: 'SoulSearching Playlist',
          description: 'Your recommended tracks from SoulSearching',
          public: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }else {
        const data = await response.json();
        
        // playlist id is needed in the endpoint to add the recommended tracks to the playlist that was created above
        // therefore, initiliazing the playlist id using data.id of the response
        const playlistID = data.id;
        
        // tracksUri is an array of the recommended tracks
        // the map method is used to get the uri of the recommended tracks
        // the tracksuri is needed in the endpoint to add the recommended tracks to the playlist
        const tracksUri = recommendedTracks.map(track => track.uri);
        const addTracks = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + accessToken1,
              'Content-Type': 'application/json'
            },
            // used POST method to add the recommended tracks to the playlist
            // the value of the body is a stringified JSON object because the body of the request must be in JSON format
            body: JSON.stringify({
              uris: tracksUri
            })
          })
          if (!addTracks.ok) {
            throw new Error('Failed to add tracks to playlist');
          };
      }
      
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };
  
  // This helps run the function when the button to create the playlist is fixed
  const handleCreatePlaylist = () => {
    createPlaylistWithRecommendations();
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 5000);

    console.log('successful');
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
          <div className='align-middle flex flex-col justify-center'>
            <div className='container-1 text-white p-14 flex flex-row justify-between align-middle' >
              <div className='intro'>
                <h1 className='text-3xl font-sans font-semibold '> Welcome to SoulSearching {userData.display_name}</h1>
                <p className='font-sans font-light text-lg pt-1'> A website to help build your personalized playlist using Spotify API </p>
              </div>
              <div className='user-info flex flex-row align-middle'>
                <img src={userData.images[0].url} alt="User Profile" className='w-10 h-10 mr-2 rounded-full' />
                <button className='font-sans font-semibold rounded-full bg-blue-600 w-20 h-10 ' onClick={handleLogout}>logout</button>
              </div>
            </div>
              <div className='alert text-center align-middle flex justify-center' role='alert'>
               {alertVisible && (
                <div className='alert-container bg-sky-300 bg-opacity-60 p-5  rounded-sm text-white duration-75'>
                  <h1>Playlist created! Check your Spotify.</h1>
                </div>
              )}
              </div>
            
            <div className='container-2 p-14 flex flex-row justify-between'>
              <div className='user-profile flex flex-col flex-wrap w-2/4'>
                <h1 className='text-2xl font-sans font-semibold text-white pb-1 text-left'>Your Top 5 Tracks</h1>
                <p className='text-lg font-sans font-normal text-slate-300'>Generate new songs based on your top tracks</p>
                <div className='top-tracks flex flex-row flex-wrap'>
                {userTracks.map((track) => (
                    <div key={track.id} className='bg-black bg-opacity-60 m-4 w-56 flex flex-col align-middle justify-center text-left p-4 rounded-md text-white '>
                        {track.album.images && track.album.images[0] && (
                          <img className='w-full'src={track.album.images[0].url} alt="album cover" />
                        )}
                        <h3 className='pt-3 pb-5 font-semibold '>{track.name}</h3>
                        <p className='text-slate-300'>{track.artists.map(artist => artist.name)}</p>
                  </div>
                    ))}
                </div>
              </div>
              <div className='suggested-playlist w-2/5'>
                  
                <h2 className='text-2xl font-sans font-semibold text-white pb-3 text-left'>Recommended Tracks</h2>
                <div className='recommended-tracks flex flex-col flex-wrap justify-center align-middle bg-black bg-opacity-50 p-5 rounded-md'>
                  <img className='bg-black' src='#' />
                  {recommendedTracks.map((track) => (
                    // <div key={track.id} className='bg-black bg-opacity-60 m-4 flex flex-wrap text-center p-4 rounded-md text-white'>
                        <div key={track.id} className='bg-black bg-opacity-60 m-4 flex flex-row flex-wrap text-center p-4 rounded-md text-white'>
                          <img src={track.album.images[1].url} />
                          {/* {track.album.images && track.album.images[1] && (
                            <img src={track.album.images[1].url} alt="album cover" />
                          )} */}
                          <h3 clas>{track.name}</h3>
                          <p>{track.artists.map(artist => artist.name)}</p>
                        </div>
                  ))}
                   <button className='mt-4 p-2 bg-green-600 text-white rounded' onClick={handleCreatePlaylist}>
                    Create Playlist with Recommended Tracks
                  </button>
                </div>
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
