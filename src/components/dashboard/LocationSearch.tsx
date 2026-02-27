
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Navigation, Loader2, X, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUPPORTED_CITIES, findNearestCity, CityLocation, searchLocations, reverseGeocode } from "@/lib/locations";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

interface LocationSearchProps {
  currentCity: string;
  onLocationChange: (city: string, lat?: number, lng?: number) => void;
  disabled?: boolean;
}

export function LocationSearch({ currentCity, onLocationChange, disabled }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentCities, setRecentCities] = useState<CityLocation[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "k") {
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 10);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("recent_investigations");
    if (saved) {
      setRecentCities(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        const results = await searchLocations(query);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const addToRecent = useCallback((location: CityLocation) => {
    const updated = [location, ...recentCities.filter(c => c.name !== location.name)].slice(0, 5);
    setRecentCities(updated);
    localStorage.setItem("recent_investigations", JSON.stringify(updated));
  }, [recentCities]);

  const handleSelect = (location: CityLocation) => {
    onLocationChange(location.name, location.lat, location.lng);
    addToRecent(location);
    setOpen(false);
    setQuery("");
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
        // Get real name from coordinates
        const location = await reverseGeocode(latitude, longitude);
        if (location) {
          handleSelect(location);
        } else {
          // Fallback to nearest supported node if reverse geocode fails
          const nearest = findNearestCity(latitude, longitude);
          handleSelect(nearest);
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
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-lg group">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div 
              className={cn(
                "flex items-center gap-3 px-4 h-14 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl transition-all cursor-text hover:bg-white",
                open && "ring-2 ring-primary/10 border-primary/20 bg-white shadow-xl scale-[1.02]"
              )}
              onClick={() => inputRef.current?.focus()}
            >
              <Search className={cn("w-5 h-5 transition-colors", open ? "text-primary" : "text-muted-foreground/50")} />
              <input 
                ref={inputRef}
                value={open ? query : currentCity}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setOpen(true);
                  setQuery("");
                }}
                placeholder="Examine risk in another region..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/40"
                disabled={disabled}
              />
              <div className="flex items-center gap-1">
                {query && open && (
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => { e.stopPropagation(); setQuery(""); }}
                   >
                     <X className="w-3.5 h-3.5" />
                   </Button>
                )}
                {!open && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Live Node</span>
                  </div>
                )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[var(--radix-popover-trigger-width)] bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-2xl mt-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            align="start"
            sideOffset={8}
          >
            <div className="p-2 space-y-1">
              {/* Location Detection */}
              <button 
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-left transition-all group/btn"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                </div>
                <div>
                   <p className="text-xs font-bold text-foreground">Detect Live Location</p>
                   <p className="text-[10px] text-muted-foreground font-medium">Automatic node synchronization</p>
                </div>
              </button>

              <div className="h-px bg-border/40 mx-2 my-2" />

              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                  {isSearching ? "Searching Node Mesh..." : query ? "Search Results" : recentCities.length > 0 ? "Recent Investigations" : "Regional Nodes"}
                </span>
                {isSearching && <Loader2 className="w-2.5 h-2.5 animate-spin text-primary/40" />}
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                {/* Search Results */}
                {query.length >= 3 && searchResults.map((location, idx) => (
                  <button
                    key={`${location.name}-${idx}`}
                    onClick={() => handleSelect(location)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 text-left transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{location.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{location.state}</p>
                      </div>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-primary/40 group-hover/item:text-primary transition-colors" />
                  </button>
                ))}

                {/* Recents */}
                {!query && recentCities.length > 0 && recentCities.map((location, idx) => (
                  <button
                    key={`recent-${idx}`}
                    onClick={() => handleSelect(location)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-left transition-all"
                  >
                    <History className="w-4 h-4 text-muted-foreground/40" />
                    <div>
                      <p className="text-sm font-medium">{location.name}</p>
                      <p className="text-[9px] text-muted-foreground/40 font-bold uppercase">{location.state}</p>
                    </div>
                  </button>
                ))}

                {/* Default Support List - only if not searching */}
                {!query && SUPPORTED_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 text-left transition-all group/item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-border group-hover/item:bg-primary transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{city.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{city.state}</p>
                      </div>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/20 group-hover/item:text-primary transition-colors" />
                  </button>
                ))}
                
                {query.length >= 3 && !isSearching && searchResults.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Node Not Found</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">Region outside current sensor mesh</p>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Floating Keyboard Shortcut Hint (Optional) */}
        {!open && (
           <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-muted/40 text-[9px] font-black text-muted-foreground/40 border border-border/20 uppercase tracking-widest">
             <kbd>K</kbd>
           </div>
        )}
      </div>
    </div>
  );
}
