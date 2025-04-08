import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:8000/api/hello/')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);
  return <div className="p-4 text-xl">{message}</div>;
}
