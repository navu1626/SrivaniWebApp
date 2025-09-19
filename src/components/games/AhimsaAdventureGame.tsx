import React, { useRef, useEffect, useState } from 'react';

// Simple character and obstacle positions
const GRID_SIZE = 8;
const INIT_POS = { x: 0, y: GRID_SIZE - 1 };
const OBSTACLES = [
  { x: 2, y: 6 },
  { x: 4, y: 4 },
  { x: 6, y: 2 },
];
const GOAL = { x: GRID_SIZE - 1, y: 0 };

function isObstacle(x: number, y: number) {
  return OBSTACLES.some(o => o.x === x && o.y === y);
}

export default function AhimsaAdventureGame({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState(INIT_POS);
  const [message, setMessage] = useState('Use arrow keys to move. Reach the dove!');
  const [won, setWon] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (won) return;
      let { x, y } = pos;
      if (e.key === 'ArrowUp') y = Math.max(0, y - 1);
      if (e.key === 'ArrowDown') y = Math.min(GRID_SIZE - 1, y + 1);
      if (e.key === 'ArrowLeft') x = Math.max(0, x - 1);
      if (e.key === 'ArrowRight') x = Math.min(GRID_SIZE - 1, x + 1);
      if (isObstacle(x, y)) {
        setMessage('Obstacle! Choose a peaceful path.');
        return;
      }
      setPos({ x, y });
      setMessage('');
      if (x === GOAL.x && y === GOAL.y) {
        setWon(true);
        setMessage('Congratulations! You reached Ahimsa.');
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pos, won]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-2 text-orange-700">Ahimsa Adventure</h2>
        <p className="mb-4 text-gray-700">Navigate the character to the dove (🕊️) without hitting obstacles. Use arrow keys!</p>
        <div className="grid grid-cols-8 gap-1 mb-4" style={{ width: 320, height: 320 }}>
          {[...Array(GRID_SIZE)].map((_, row) =>
            [...Array(GRID_SIZE)].map((_, col) => {
              const isChar = pos.x === col && pos.y === row;
              const isGoal = GOAL.x === col && GOAL.y === row;
              const isObs = isObstacle(col, row);
              return (
                <div
                  key={row + '-' + col}
                  className={`flex items-center justify-center border rounded bg-gray-50 ${isChar ? 'bg-green-200' : isGoal ? 'bg-blue-100' : isObs ? 'bg-red-100' : ''}`}
                  style={{ width: 36, height: 36 }}
                >
                  {isChar ? <span role="img" aria-label="character">🙂</span> : isGoal ? <span role="img" aria-label="dove">🕊️</span> : isObs ? <span role="img" aria-label="obstacle">🌵</span> : null}
                </div>
              );
            })
          )}
        </div>
        <div className="mb-4 text-orange-600 font-semibold min-h-[24px]">{message}</div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
