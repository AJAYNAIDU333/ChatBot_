import { useState } from 'react';
import Login from './Login';
import Chat from './Chat';

const Index = () => {
  const [user, setUser] = useState<string | null>(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Chat userEmail={user} onLogout={() => setUser(null)} />;
};

export default Index;
