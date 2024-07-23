const express = require('express');
const { access } = require('fs');
const querystring = require('querystring');
const request = require('request');
//OKAY LETS BREAK THIS CODE DOWN

//why do we need express(line 1)
//this is making the webserver and handles http requests
//query string is needed for formatting url strings
//requests makes life better for http requests

const client_id = 'e097348e568243fe862de9cf3d2504b1'; 
const client_secret = 'bf46ce6b7e70464996fb26f598bc81ca'; 
const redirect_uri = 'http://localhost:3001/callback'; 

//this is our sauce above, 

const app = express();// this is making our express aplication


//okay what is going on here
//purpose: This does the initial step of user AUTH with spotify. when user accesses /login, the server makes a random state and redirects the user to the spotify auth page.
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-library-read playlist-read-private user-top-read user-follow-read playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: 'true'
    }));
});
//WHEN THE FUCKING HTTPS/LOCALHOST:3001' DOES THE LITTLE /LOGIN, WITH THE LINK IT RUNS THIS CODE, WHICH REDIRECTS THEM TO SPOTIFY AUTH PAGE, THEN THE REDIRECT URI SENDS THEM BACK TO THE FOLLOWING URI WHEN DONE .

//Purpose: handes the callback from spotify after the user logs in. and exhanges the authcode for an access token, this access token is our api key then uses this access token to fetch user data.

//so after the login where does the authcode come from?
app.get('/callback', (req, res) => {

  const code = req.query.code || null;//in the fucking url, it looks at the word {code} and parses through the url, to see what it equals too
  console.log("CODE= " ,code)
  console.log("\n")

  //now we have the authcode
  const state = req.query.state || null;
  //same for state, and state is just for safety
  console.log("state=", state)
  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));//checks if state is the same
  } else {

    //now that we have our code, we are going to send a POST request to the following 
    //why?
    //becuase now that we got our special code, we can go on the spotify website and exchange that code for a token, 
    //in the doc it shows you how to request access token, 
    //
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      //they need all this info, look in the docs.
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token1 = body.access_token;
        const refresh_token1 = body.refresh_token;

      // Redirect to React app with access token
       res.redirect(`http://localhost:3000/?access_token1=${access_token1}&refresh_token1=${refresh_token1}`);
      // res.redirect('http://localhost:3000');
      } else {
        res.send('Error while authenticating with Spotify.');
      }

      

    });
}});
app.get('/logout',(req , res) =>{
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-library-read playlist-read-private user-top-read user-follow-read playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: 'true'
    }));
})

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}



app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

