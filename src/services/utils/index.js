import React        from 'react';
import fetch        from 'isomorphic-fetch';

window.SDATA = window.SDATA || {};

const bcrypt 	= require('bcryptjs'),
    crypto 		= require('crypto'),
    algorithm 	= 'aes-256-ctr',
    password 	= 'a8E7Yg2S';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const buildHeaders = () => {
  const authToken = localStorage.getItem('phoenixAuthToken');

  return { ...defaultHeaders, Authorization: authToken };
}

export const waitForDeviceReady = () => {
  return new Promise((resolve) => {
    document.addEventListener('deviceready', (v) => {
			document.addEventListener("online",()=>{ console.log('++++++++++ONLINE++++++++++'); window.SDATA.online = true; }, false);
			document.addEventListener("offline",()=>{ console.log('--------OFFLINE-------'); window.SDATA.online = false; }, false);
      resolve(v);
    }, false);
  });
}

export const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export const parseJSON = response => {
  return response.json();
}

export const httpGet = url => {

  return fetch(url, {
    headers: buildHeaders(),
  })
  .then(checkStatus)
  .then(parseJSON);
}

export const httpPost = ( url, data ) => {
  const body = JSON.stringify(data);

  return fetch(url, {
    method: 'post',
    headers: buildHeaders(),
    body: body,
  })
  .then(checkStatus)
  .then(parseJSON);
}

export const httpDelete = url => {
  return fetch(url, {
    method: 'delete',
    headers: buildHeaders(),
  })
  .then(checkStatus)
  .then(parseJSON);
}

export const setDocumentTitle = title => {
  document.title = `${title} | DoMore`;
}

export const renderErrorsFor = ( errors, ref ) => {
  if (!errors) return false;

  return errors.map((error, i) => {
    if (error[ref]) {
      return (
        <div key={i} className="error">
          {error[ref]}
        </div>
      );
    }
    return null;
  });
}

export const encrypt = text => {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

export const decrypt = text => {
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

export const hash = pass => {
  return bcrypt.hashSync(pass, 10);
}

export const compareHash = (pass, hash) => {
  return (bcrypt.compareSync(pass, hash));
}
