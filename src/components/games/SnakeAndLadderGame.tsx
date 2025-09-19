import React, { useState } from 'react';
// Image-based board design for Mukti Sopaan (Jain Snake and Ladder)
const BOARD_LAYOUT = [
  // Each cell: { num, label, symbol, snakeTo, ladderTo }
  // Example for first row (1-10), fill out as per image
  { num: 1, label: 'निर्णय शक्ति', symbol: '🌱' },
  { num: 2, label: 'पंचम', symbol: '🐚' },
  { num: 3, label: 'पंचम', symbol: '🐚' },
  { num: 4, label: 'पंचम', symbol: '🐚' },
  { num: 5, label: 'पंचम', symbol: '🐚' },
  { num: 6, label: 'पंचम', symbol: '🐚' },
  { num: 7, label: 'पंचम', symbol: '🐚' },
  { num: 8, label: 'पंचम', symbol: '🐚' },
  { num: 9, label: 'पंचम', symbol: '🐚' },
  { num: 10, label: 'पंचम', symbol: '🐚' },
  // ...continue for all 100 cells, using image for reference
];

const BOARD_SIZE = 10;
const SNAKES = { 16: 6, 48: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

function getPosition(num) {
  const row = BOARD_SIZE - 1 - Math.floor((num - 1) / BOARD_SIZE);
  const col = ((row % 2 === 0) ? (num - 1) % BOARD_SIZE : BOARD_SIZE - 1 - ((num - 1) % BOARD_SIZE));
  return { row, col };
}

export default function SnakeAndLadderGame({ onClose }) {
  const [players, setPlayers] = useState([
    { name: 'खिलाड़ी 1', pos: 1, color: '#e53935' },
    { name: 'खिलाड़ी 2', pos: 1, color: '#3949ab' }
  ]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState(null);
  const [message, setMessage] = useState('खेल शुरू करें!');

  function rollDice() {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDice(roll);
    setMessage(`${players[turn].name} ने ${roll} फेंका!`);
    setTimeout(() => movePlayer(roll), 600);
  }

  function movePlayer(roll) {
    let newPos = players[turn].pos + roll;
    if (newPos > 100) newPos = players[turn].pos;
    if (SNAKES[newPos]) {
      setMessage(`${players[turn].name} साँप पर आ गया! ${newPos} → ${SNAKES[newPos]}`);
      newPos = SNAKES[newPos];
    } else if (LADDERS[newPos]) {
      setMessage(`${players[turn].name} सीढ़ी पर चढ़ गया! ${newPos} → ${LADDERS[newPos]}`);
      newPos = LADDERS[newPos];
    } else {
      setMessage(`${players[turn].name} अब ${newPos} पर है।`);
    }
    const updated = players.map((p, idx) => idx === turn ? { ...p, pos: newPos } : p);
    setPlayers(updated);
    if (newPos === 100) {
      setMessage(`${players[turn].name} जीत गया! 🏆`);
      return;
    }
    setTurn((turn + 1) % players.length);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0" style={{paddingTop: '72px'}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full flex flex-col items-center overflow-y-auto" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 72px)' }}>
  <h2 className="text-3xl font-bold mb-2 text-red-700">मुक्ति सोपान</h2>
  <div className="mb-2 text-lg text-blue-900 font-bold">(अच्छे-बुरे भावों का फल)</div>
  <p className="mb-4 text-gray-700 font-semibold">यह मात्र एक खेल (GAME) नहीं है, अपितु हृदय तक पहुँचने वाले कर्मों के फलों का प्रत्यक्ष लेखा-जोखा है। सभी जीवन संस्कारों की अमिट छाप डालने वाला पथ है।</p>
        <div className="mb-4 text-left w-full max-w-xl mx-auto p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-bold text-red-800 mb-2">कैसे खेलें</h3>
          <ul className="list-disc pl-6 text-red-700 text-base space-y-1">
            <li>खिलाड़ी बारी-बारी से पासा फेंकते हैं।</li>
            <li>साँप पर आने पर नीचे गिरना पड़ता है, सीढ़ी पर आने पर ऊपर चढ़ना पड़ता है।</li>
            <li>पहला खिलाड़ी जो 100 तक पहुँचता है, जीतता है।</li>
            <li>खेल के दौरान जैन मूल्यों जैसे अहिंसा, सत्य, संयम, और मुक्ति मार्ग का अनुसरण करें।</li>
          </ul>
          <div className="mt-2 text-sm text-blue-900">सीढ़ी समझें और करें, पाप छोड़कर पुण्य करें। नहीं निगोद में पड़ना है, मुक्ति पथ पर चलना है।</div>
        </div>
        <div className="grid grid-cols-10 gap-1 mb-4" style={{ width: 400, height: 400 }}>
          {[...Array(100)].map((_, i) => {
            const num = i + 1;
            const { row, col } = getPosition(num);
            const playerHere = players.find(p => p.pos === num);
            // Use BOARD_LAYOUT for labels and symbols if available
            const cell = BOARD_LAYOUT[num-1] || { num };
            return (
              <div key={num} className={`flex flex-col items-center justify-center border rounded text-[10px] font-bold ${playerHere ? 'bg-yellow-200' : 'bg-white'}`} style={{ gridRow: row + 1, gridColumn: col + 1, height: 36, width: 36, position: 'relative' }}>
                <div>{num}</div>
                {cell.label && <div className="text-[8px] text-gray-700 leading-tight">{cell.label}</div>}
                {cell.symbol && <div>{cell.symbol}</div>}
                {SNAKES[num] && <span className="absolute left-0 bottom-0 text-red-600">🐍</span>}
                {LADDERS[num] && <span className="absolute right-0 top-0 text-blue-600">🪜</span>}
                {playerHere && <span className="absolute right-0 bottom-0" style={{ color: playerHere.color }}>●</span>}
              </div>
            );
          })}
        </div>
  <div className="mb-4 text-lg text-red-800 font-semibold">{message}</div>
        <div className="flex gap-4 mb-4">
          <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors" onClick={rollDice} disabled={dice !== null && message.includes('जीत गया')}>पासा फेंके</button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold transition-colors" onClick={onClose}>बंद करें</button>
        </div>
      </div>
    </div>
  );
}
