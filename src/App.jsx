import { useState, useRef, useEffect } from 'react';
import { Plus, X, Palette } from 'lucide-react';

const colors = [
  { name: 'Orange', bg: 'bg-orange-400', header: 'bg-orange-500', text: 'text-orange-950' },
  { name: 'Purple', bg: 'bg-purple-400', header: 'bg-purple-500', text: 'text-purple-950' },
  { name: 'Green', bg: 'bg-lime-400', header: 'bg-lime-500', text: 'text-lime-950' },
  { name: 'Black', bg: 'bg-gray-800', header: 'bg-gray-900', text: 'text-gray-100' },
  { name: 'Red', bg: 'bg-red-500', header: 'bg-red-600', text: 'text-red-950' },
  { name: 'Yellow', bg: 'bg-yellow-400', header: 'bg-yellow-500', text: 'text-yellow-950' },
];

const Bat = ({ style, delay }) => (
  <div className="absolute text-2xl" style={{ ...style, animation: `float 3s ease-in-out ${delay}s infinite` }}>🦇</div>
);

const Spider = ({ style }) => (
  <div className="absolute text-4xl animate-bounce" style={style}>🕷️</div>
);

const Note = ({ note, onUpdate, onDelete, onDragStart }) => {
  const [showColors, setShowColors] = useState(false);
  const color = colors[note.colorIndex];

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    onDragStart(note.id, e.clientX - note.x, e.clientY - note.y);
  };

  const handleResize = (e) => {
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY, startW = note.width, startH = note.height;
    const onMove = (ev) => {
      onUpdate(note.id, { width: Math.max(180, startW + ev.clientX - startX), height: Math.max(120, startH + ev.clientY - startY) });
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className={`absolute ${color.bg} rounded-lg shadow-lg shadow-orange-500/20 flex flex-col overflow-hidden border-2 border-orange-600/30`} style={{ left: note.x, top: note.y, width: note.width, height: note.height, zIndex: note.zIndex }} onMouseDown={handleMouseDown}>
      <div className={`${color.header} px-2 py-1 flex items-center justify-between cursor-move`}>
        <span className={`text-xs font-medium ${color.text} opacity-70`}>🎃 {new Date(note.created).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          <div className="relative no-drag">
            <button onClick={() => setShowColors(!showColors)} className={`p-1 rounded hover:bg-black/10 ${color.text}`}><Palette size={14} /></button>
            {showColors && (
              <div className="absolute right-0 top-6 bg-gray-900 rounded-lg shadow-xl p-2 flex gap-1 z-50 border border-orange-500">
                {colors.map((c, i) => (<button key={i} onClick={() => { onUpdate(note.id, { colorIndex: i }); setShowColors(false); }} className={`w-6 h-6 rounded-full ${c.bg} border-2 ${note.colorIndex === i ? 'border-orange-300' : 'border-transparent'} hover:scale-110 transition-transform`} />))}
              </div>
            )}
          </div>
          <button onClick={() => onDelete(note.id)} className={`p-1 rounded hover:bg-black/10 ${color.text} no-drag`}><X size={14} /></button>
        </div>
      </div>
      <textarea value={note.content} onChange={(e) => onUpdate(note.id, { content: e.target.value })} placeholder="Type your spooky note..." className={`flex-1 p-3 bg-transparent resize-none outline-none ${color.text} placeholder-current placeholder-opacity-40 no-drag text-sm`} style={{ minHeight: 0 }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize no-drag" onMouseDown={handleResize}>
        <svg viewBox="0 0 16 16" className={`${color.text} opacity-30`}><path d="M14 14H8v-1h5V8h1v6zm-3 0H8v-1h3v1zm0-3H8v-1h3v1z" fill="currentColor"/></svg>
      </div>
    </div>
  );
};

export default function App() {
  const [notes, setNotes] = useState([
    { id: 1, x: 40, y: 60, width: 220, height: 180, content: '👻 Welcome to Spooky Notes!\n\n• Click + to add notes\n• Drag to move\n• Resize from corner\n\nHappy Halloween! 🎃', colorIndex: 0, zIndex: 1, created: Date.now() },
    { id: 2, x: 300, y: 100, width: 200, height: 160, content: '🍬 Candy List:\n- Snickers\n- Reeses\n- Kit Kat\n- Skittles', colorIndex: 1, zIndex: 2, created: Date.now() - 86400000 },
  ]);
  const [dragging, setDragging] = useState(null);
  const [maxZ, setMaxZ] = useState(3);
  const containerRef = useRef(null);

  const addNote = () => {
    const offset = (notes.length % 5) * 30;
    setMaxZ(z => z + 1);
    setNotes([...notes, { id: Date.now(), x: 100 + offset, y: 100 + offset, width: 200, height: 160, content: '', colorIndex: Math.floor(Math.random() * colors.length), zIndex: maxZ + 1, created: Date.now() }]);
  };

  const updateNote = (id, updates) => setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));
  const handleDragStart = (id, offsetX, offsetY) => { setMaxZ(z => z + 1); setNotes(notes.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n)); setDragging({ id, offsetX, offsetY }); };

  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateNote(dragging.id, { x: Math.max(0, Math.min(e.clientX - dragging.offsetX, rect.width - 100)), y: Math.max(0, Math.min(e.clientY - dragging.offsetY, rect.height - 50)) });
  };

  useEffect(() => {
    if (dragging) {
      const handleMouseUp = () => setDragging(null);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }
  }, [dragging]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative" ref={containerRef}>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-15px) rotate(5deg); } } @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } } @keyframes sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }`}</style>
      {[...Array(20)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-purple-400 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `twinkle ${1 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite` }} />))}
      <Bat style={{ left: '10%', top: '15%' }} delay={0} /><Bat style={{ right: '15%', top: '20%' }} delay={0.5} /><Bat style={{ left: '50%', top: '10%' }} delay={1} />
      <Spider style={{ right: '10%', top: '5%' }} />
      <div className="absolute bottom-4 left-4 text-4xl" style={{ animation: 'sway 2s ease-in-out infinite' }}>🎃</div>
      <div className="absolute bottom-4 right-4 text-4xl" style={{ animation: 'sway 2s ease-in-out 0.5s infinite' }}>🎃</div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl">🕸️</div>
      <div className="absolute top-16 left-4 text-2xl">💀</div>
      <div className="absolute top-20 right-8 text-2xl">👻</div>
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-800 via-purple-900 to-gray-800 flex items-center px-4 gap-3 border-b-2 border-orange-500 z-50">
        <div className="flex items-center gap-2"><div className="text-2xl">🎃</div><span className="text-orange-400 font-bold tracking-wide" style={{ textShadow: '0 0 10px rgba(251, 146, 60, 0.5)' }}>Spooky Notes</span></div>
        <button onClick={addNote} className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-black rounded-md font-bold text-sm transition-colors shadow-lg shadow-orange-500/30"><Plus size={16} />New Note</button>
        <div className="ml-auto text-purple-300 text-sm flex items-center gap-2"><span>👻</span>{notes.length} spooky note{notes.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="pt-12 w-full h-full">
        {notes.map(note => (<Note key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} onDragStart={handleDragStart} />))}
        {notes.length === 0 && (<div className="absolute inset-0 flex items-center justify-center"><div className="text-center text-orange-400"><div className="text-6xl mb-4">👻</div><p className="text-lg">No spooky notes yet</p><p className="text-sm text-purple-400">Click "New Note" to get started</p></div></div>)}
      </div>
    </div>
  );
}
