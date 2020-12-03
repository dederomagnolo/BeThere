import { bethereUrl } from '../configs';

async function callApi (
  method, 
  service, 
  payload, 
  token) {
 
  const parameters = {
    method,
    body: payload && JSON.stringify(payload),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "auth-token": token ? token : ''
    },
  };
  const url = `${bethereUrl}${service}`;

  try {
      const res = await fetch(url, parameters);
      const content = await res.json();
      return content;
      // we can make messages for different status codes
  } catch(err) {
      console.log(err);
      throw new Error(err.message); 
  }
};

export default callApi;