'use client';

import { useState, useEffect } from 'react';

type Props = {
  onSelect: (symbol: string) => void;
};

export default function SearchBar({ onSelect }: Props) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);

  useEffect(() => {
    const fetchSymbols = async () => {
      const res = await fetch('/api/symbol'); // pastikan endpoint ini benar
      const json = await res.json();
      setSymbols(json.symbols);
    };
    fetchSymbols();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredSymbols([]);
      return;
    }

    const filtered = symbols.filter((s) =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSymbols(filtered.slice(0, 10));
  }, [searchTerm, symbols]);

  return (
    <div className="p-4 relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
        placeholder="Search symbol (e.g. BTC)"
        className="text-white p-2 rounded-md mr-2 border-2 bg-transparent"
      />
      {filteredSymbols.length > 0 && (
        <ul className="bg-[#424242] text-white rounded-md max-h-40 overflow-auto mt-2 absolute z-10 w-50">
          {filteredSymbols.map((sym) => (
            <li
              key={sym}
              className="px-2 hover:bg-[#383838] cursor-pointer"
              onClick={() => {
                onSelect(sym.toLowerCase()); // Kirim ke parent
                setSearchTerm('');
                setFilteredSymbols([]);
              }}
            >
              {sym}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
