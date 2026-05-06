import dns from 'node:dns';
const name = '_mongodb._tcp.cluster0.8wwsqlu.mongodb.net';
dns.resolveSrv(name, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution Error:', err);
  } else {
    console.log('SRV Addresses:', addresses);
  }
});
