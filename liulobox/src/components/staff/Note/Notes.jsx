import React, { useState } from 'react';

function Notes() {
  const [note, setNote] = useState(localStorage.getItem('dashboardNote') || '');

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    localStorage.setItem('dashboardNote', newNote); // Lưu tạm vào localStorage
  };

  return (
    <div className="notes-box">
      <h3>Ghi chú</h3>
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="Viết ghi chú tại đây..."
        rows="5"
      />
    </div>
  );
}

export default Notes;