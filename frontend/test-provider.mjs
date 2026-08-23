import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';

const provider = new FetchZkConfigProvider('https://frontend-one-pi-zkum5l95zz.vercel.app/keys', {
  fetchFunc: (url, init) => {
    console.log('FETCH CALLED', url);
    return fetch(url.replace(/#/g, '%23'), init);
  },
  verify: 'off'
});

provider.getVerifierKey('manifest#openBidding')
  .then(res => console.log('SUCCESS:', res.slice(0, 10)))
  .catch(err => {
    console.error('ERROR:', err);
    if (err.cause) console.error('CAUSE:', err.cause);
  });
