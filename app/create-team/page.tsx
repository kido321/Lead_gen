'use client';
import { useState } from 'react';

export default function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateTeam = async () => {
    const res = await fetch('/api/create-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName }),
    });
    const data = await res.json();
    if (data.error) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage('Team created successfully!');
    }
  };

  return (
    <div>
      <h1>Create a Team</h1>
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Team Name"
      />
      <button onClick={handleCreateTeam}>Create Team</button>
      {message && <p>{message}</p>}
    </div>
  );
}
