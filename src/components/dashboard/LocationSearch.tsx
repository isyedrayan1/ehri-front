"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Navigation, Loader2, X, History, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { CityLocation, searchLocations, reverseGeocode } from "@/lib/locations";

interface LocationSearchProps {
  currentCity: string | null;
  onLocationChange: (city: string, lat?: number, lng?: number) => void;
  disabled?: boolean;
}

export function LocationSearch({ currentCity, onLocationChange, disabled }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(currentCity || "");
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentCities, setRecentCities] = useState<CityLocation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Command+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("recent_investigations");
    if (saved) setRecentCities(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setQuery(currentCity || "");
  }, [currentCity]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && query.length >= 3 && query !== currentCity) {
        setIsSearching(true);
        const results = await searchLocations(query);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, currentCity]);

  const addToRecent = useCallback((location: CityLocation) => {
    const updated = [location, ...recentCities.filter(c => c.name !== location.name)].slice(0, 5);
    setRecentCities(updated);
    localStorage.setItem("recent_investigations", JSON.stringify(updated));
  }, [recentCities]);

  const handleSelect = (location: CityLocation) => {
    onLocationChange(location.name, location.lat, location.lng);
    addToRecent(location);
    setOpen(false);
    setQuery(location.name);
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = await reverseGeocode(latitude, longitude);
        if (location) {
          handleSelect(location);
        } else {
          alert("Could not resolve location name. Please try searching manually.");
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        alert("Failed to detect location. Please check browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center relative">
      <div 
        className={cn(
          "relative w-full max-w-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "z-[100]" : "z-10"
        )}
      >
        {/* Search Input Bar */}
        <div 
          className={cn(
            "flex items-center gap-3 px-5 h-14 bg-white/80 backdrop-blur-3xl border transition-all duration-300",
            open 
              ? "rounded-t-2xl border-white/40 border-b-0 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] bg-white/95" 
              : "rounded-2xl border-white/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_45px_-10px_rgba(0,0,0,0.1)] hover:bg-white"
          )}
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Search className={cn("w-4 h-4 transition-all duration-500", open ? "text-primary scale-110" : "text-muted-foreground/30")} />
            )}
          </div>
          
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={(e) => {
              setOpen(true);
              e.target.select();
            }}
            placeholder="Examine risk in another node..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground/20 focus:ring-0 text-slate-700"
            disabled={disabled}
          />

          <div className="flex items-center gap-2">
            {query && (
              <button 
                onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus(); }}
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors group"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </button>
            )}
            {!open && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 shadow-sm">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Results - Integrated Appearance */}
        <div 
          className={cn(
            "absolute top-full left-0 right-0 bg-white/95 backdrop-blur-3xl border border-white/40 border-t-0 rounded-b-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500 origin-top",
            open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-3 space-y-1">
            {/* Locate Me Action */}
            <button 
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="w-full h-14 flex items-center gap-4 px-4 rounded-xl hover:bg-primary/5 text-left transition-all group/locate active:scale-[0.98]"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover/locate:bg-primary group-hover/locate:text-white transition-all duration-500 shadow-sm border border-primary/5">
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                 <p className="text-xs font-bold text-slate-800">Detect Live Node</p>
                 <p className="text-[10px] text-slate-400 font-semibold opacity-60">Synchronize from current GPS</p>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[8px] font-black uppercase tracking-widest text-green-600">Active</span>
              </div>
            </button>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent my-3" />

            <div className="px-4 py-1">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                {(query?.length || 0) >= 3 ? "Grounded Hubs" : recentCities.length > 0 ? "Recent Investigations" : "Standard Nodes"}
              </span>
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1 pb-4">
              {/* Search Results with staggered animation effect */}
              {query.length >= 3 && searchResults.map((location, idx) => (
                <button
                  key={`${location.name}-${idx}`}
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 group/node transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary/20 group-hover/node:bg-primary group-hover/node:border-primary transition-all duration-500 shadow-[0_0_12px_rgba(var(--primary),0)] group-hover/node:shadow-[0_0_12px_rgba(var(--primary),0.3)]" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{location.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{location.state}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/node:bg-white group-hover/node:shadow-md transition-all">
                    <MapPin className="w-3.5 h-3.5 text-slate-200 group-hover/node:text-primary transition-colors" />
                  </div>
                </button>
              ))}

              {/* Recents */}
              {!query && recentCities.length > 0 && recentCities.map((location, idx) => (
                <button
                  key={`recent-${idx}`}
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group/recent"
                >
                  <History className="w-4 h-4 text-slate-200 group-hover/recent:text-primary transition-colors duration-500" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{location.name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{location.state}</p>
                  </div>
                </button>
              ))}

              {/* Empty / Error state */}
              {query.length >= 3 && !isSearching && searchResults.length === 0 && (
                <div className="p-16 text-center animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-5 border border-slate-100">
                    <Search className="w-6 h-6 text-slate-100" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Hub Unknown</p>
                  <p className="text-[9px] text-slate-200 mt-2 font-bold uppercase tracking-widest leading-loose">
                    Outside Grounded Sensor Mesh
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
