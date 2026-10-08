import React from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import PlazaPageV1 from '../pages/PlazaPageV1.jsx';
import { createPlazaRealtimeClientV1 } from '../runtime/plazaRealtimeClientV1.js';

// Local review only. This entry does not change app auth or production routes.
const allowed = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(location.hostname);
let member = sessionStorage.getItem('cing-plaza-lobby-demo-member');
if (!member) { member = crypto.randomUUID(); sessionStorage.setItem('cing-plaza-lobby-demo-member', member); }
const createClient = () => createPlazaRealtimeClientV1({
  url: `http://${location.hostname}:3009`, ioFactory: io, getToken: () => member,
});
createRoot(document.getElementById('root')).render(allowed
  ? <PlazaPageV1 enabled createClient={createClient} />
  : <p>Bản kiểm tra phòng chỉ mở trên máy local.</p>);
