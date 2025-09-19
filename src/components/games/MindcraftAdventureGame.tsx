import React, { useRef, useEffect, useState } from 'react';

const WORLD_SIZE = 32;
const BLOCK_SIZE = 24;
const PLAYER_COLOR = '#2196f3';
const BLOCK_COLORS = ['#8d5524', '#228B22', '#FFD700', '#A9A9A9']; // dirt, grass, gold, stone

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export default function MindcraftAdventureGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: 2, y: 2 });
  const [world, setWorld] = useState<null | number[][]>(null);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const arr = Array.from({ length: WORLD_SIZE }, () =>
        Array.from({ length: WORLD_SIZE }, () => getRandomInt(BLOCK_COLORS.length))
      );
      setWorld(arr);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (!world) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw world
    for (let y = 0; y < WORLD_SIZE; y++) {
      for (let x = 0; x < WORLD_SIZE; x++) {
        ctx.fillStyle = BLOCK_COLORS[world[y][x]];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
    // Draw player
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(player.x * BLOCK_SIZE, player.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x * BLOCK_SIZE, player.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }, [player, world]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (loading || !world) return;
      let { x, y } = player;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp') y = Math.max(0, y - 1);
      if (e.key === 'ArrowDown') y = Math.min(WORLD_SIZE - 1, y + 1);
      if (e.key === 'ArrowLeft') x = Math.max(0, x - 1);
      if (e.key === 'ArrowRight') x = Math.min(WORLD_SIZE - 1, x + 1);
      if (e.key === ' ') {
        // Place block
        setWorld(prev => {
          if (!prev) return prev;
          const newWorld = prev.map(row => [...row]);
          newWorld[y][x] = selectedBlock;
          return newWorld;
        });
        return;
      }
      setPlayer({ x, y });
    }
    window.addEventListener('keydown', handleKey, { passive: false });
    return () => window.removeEventListener('keydown', handleKey);
  }, [player, selectedBlock, loading, world]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-0" style={{paddingTop: '72px'}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-full flex flex-col items-center overflow-y-auto" style={{ minHeight: '600px', maxHeight: 'calc(100vh - 72px)' }}>
        <h2 className="text-3xl font-bold mb-2 text-blue-700">Ahimsa Minecraft Adventure</h2>
        <p className="mb-4 text-gray-700 font-semibold">Jain Religious Block World Game</p>
        <div className="mb-4 text-left w-full max-w-2xl mx-auto p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-2">How to Play</h3>
          <ul className="list-disc pl-6 text-blue-700 text-base space-y-1">
            <li>Move your character (blue block) using the arrow keys.</li>
            <li>Press <b>Space</b> to place a block at your current position.</li>
            <li>Select block type below to build with different materials (dirt, grass, gold, stone).</li>
            <li>Try to build peaceful Jain structures, like temples, gardens, or symbols of Ahimsa (non-violence).</li>
            <li>Use your creativity to make a world that reflects Jain values: peace, harmony, and non-violence.</li>
          </ul>
          <div className="mt-2 text-sm text-blue-900">This game is inspired by Minecraft, but the goal is to create a world that celebrates Jain teachings. Avoid destructive actions and focus on building positive, peaceful environments!</div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center w-full h-[400px]">
            <span className="text-6xl animate-bounce">🛕</span>
          </div>
        ) : (
          <canvas ref={canvasRef} width={WORLD_SIZE * BLOCK_SIZE} height={WORLD_SIZE * BLOCK_SIZE} style={{ border: '2px solid #333', background: '#222', marginBottom: 16 }} />
        )}
        <div className="flex gap-4 mb-4">
          {BLOCK_COLORS.map((color, idx) => (
            <button
              key={color}
              className={`w-10 h-10 rounded border-2 ${selectedBlock === idx ? 'border-blue-500' : 'border-gray-300'}`}
              style={{ background: color }}
              onClick={() => setSelectedBlock(idx)}
            />
          ))}
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
