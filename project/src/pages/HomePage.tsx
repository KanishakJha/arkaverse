// Find this section inside your src/pages/HomePage.tsx file around line 80:
{/* GENRE HORIZONTAL FILTER SWIPER */}
<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-4">
  {[
    { name: 'All' },
    { name: 'Romance' },
    { name: 'Mystery' },
    { name: 'Crime' },
    { name: 'Action' },
    { name: 'Adventure' },
    { name: 'Horror' },
    { name: 'Epic' },
    { name: 'Sci-Fi' }
  ].map((g) => (
    <button
      key={g.name}
      type="button"
      onClick={() => setSelectedGenre(g.name)}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shrink-0 ${
        selectedGenre === g.name 
          ? 'bg-white text-black border-white shadow-lg' 
          : 'bg-zinc-900/40 border-zinc-900/80 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {g.name}
    </button>
  ))}
</div>
