'use client';
import { useState } from 'react';

export default function SubmitLead() {
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  // In a real-world app, team_id and user_id would be retrieved from app state or Clerk's client hooks.
  const team_id = 'YOUR_TEAM_ID';
  const user_id = 'YOUR_USER_ID';

  const handleSubmit = async () => {
    const res = await fetch('/api/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id, user_id, description }),
    });
    const data = await res.json();
    if (data.error) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage('Lead submitted successfully!');
    }
  };

  return (
    <div>
      <h1>Submit a Lead</h1>
      <textarea
        placeholder="Enter lead details"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit Lead</button>
      {message && <p>{message}</p>}
    </div>
  );
}
