import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, X, Check, ExternalLink, Loader2 } from 'lucide-react';

interface MapPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (coords: { latitude: number; longitude: number }) => void;
    error?: string;
    label?: string;
    required?: boolean;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// Custom NSA Map Pin Icon using SVG to avoid missing asset issues in bundlers
const createIfaaPinIcon = () => {
    return L.divIcon({
        className: 'nsa-map-marker',
        html: `
            <div style="position: relative; width: 32px; height: 42px; transform: translate(-50%, -100%);">
                <svg viewBox="0 0 24 32" width="32" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.5 12 32 12 32C12 32 24 20.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#014081"/>
                    <circle cx="12" cy="11" r="5" fill="#3AD1F3"/>
                </svg>
            </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
    });
};

export default function MapPicker({
    latitude,
    longitude,
    onChange,
    error,
    label = 'Titik Lokasi Usaha (Google Maps)',
    required = true,
}: MapPickerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number }>({
        lat: latitude ?? -6.2088,
        lng: longitude ?? 106.8456,
    });
    const [isLocating, setIsLocating] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openLocationModal = () => {
        if (latitude !== null && longitude !== null) {
            setTempCoords({ lat: latitude, lng: longitude });
        }
        setIsModalOpen(true);
    };

    // Search autocomplete via Nominatim (Free, reliable OSM geocoding API)
    const handleSearchInput = (query: string) => {
        setSearchQuery(query);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        if (!query.trim() || query.length < 3) {
            setSearchResults([]);
            return;
        }

        debounceTimerRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        query
                    )}&countrycodes=id&limit=5`
                );
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (err) {
                console.error('Error fetching location:', err);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleSelectLocation = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setTempCoords({ lat, lng });
        onChange({ latitude: Number(lat.toFixed(7)), longitude: Number(lng.toFixed(7)) });
        setSearchResults([]);
        setSearchQuery(result.display_name.split(',')[0]);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
        }
    };

    // Initialize Leaflet Map when Modal Opens
    useEffect(() => {
        if (!isModalOpen) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
            return;
        }

        const timer = setTimeout(() => {
            if (!mapContainerRef.current) return;

            const initialLat = tempCoords.lat;
            const initialLng = tempCoords.lng;

            const map = L.map(mapContainerRef.current, {
                center: [initialLat, initialLng],
                zoom: latitude && longitude ? 15 : 6,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            const marker = L.marker([initialLat, initialLng], {
                icon: createIfaaPinIcon(),
                draggable: true,
            }).addTo(map);

            marker.on('dragend', () => {
                const position = marker.getLatLng();
                setTempCoords({ lat: position.lat, lng: position.lng });
            });

            map.on('click', (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng);
                setTempCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;
            map.invalidateSize();
        }, 150);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isModalOpen]);

    const handleApplyLocation = () => {
        onChange({
            latitude: Number(tempCoords.lat.toFixed(7)),
            longitude: Number(tempCoords.lng.toFixed(7)),
        });
        setIsModalOpen(false);
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Peramban Anda tidak mendukung deteksi lokasi otomatis.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setTempCoords({ lat, lng });

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 16);
                    markerRef.current.setLatLng([lat, lng]);
                }
            },
            (err) => {
                setIsLocating(false);
                alert(`Gagal mengambil lokasi: ${err.message}`);
            },
            { enableHighAccuracy: true }
        );
    };

    const hasCoords = latitude !== null && longitude !== null;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
                {hasCoords && (
                    <span className="text-[11px] font-mono text-ocean bg-ocean/5 px-2 py-0.5 rounded border border-ocean/20">
                        {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* Search / Coordinates Input Bar */}
                <div className="md:col-span-7 relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="Cari nama lokasi, jalan, atau pelabuhan..."
                            className="h-[44px] w-full rounded-md border border-slate-300 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 transition-colors"
                        />
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-3.5 h-4 w-4 text-ocean animate-spin" />
                        )}
                    </div>

                    {/* Autocomplete Dropdown List */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg py-1 max-h-52 overflow-y-auto">
                            {searchResults.map((res) => (
                                <button
                                    key={res.place_id}
                                    type="button"
                                    onClick={() => handleSelectLocation(res)}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-mist/70 hover:text-navy flex items-start gap-2 border-b border-slate-100 last:border-b-0 transition-colors"
                                >
                                    <MapPin className="h-3.5 w-3.5 text-ocean flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{res.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mini Preview Box with "Pilih Lokasi di Peta" Button */}
                <div className="md:col-span-5">
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-mist/30 p-1.5 pr-2">
                        <div className="relative h-10 w-16 rounded overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 flex items-center justify-center">
                            {hasCoords ? (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center relative">
                                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#056ed4_1px,transparent_1px)] [background-size:6px_6px]" />
                                    <MapPin className="h-4 w-4 text-danger z-10 animate-bounce" />
                                </div>
                            ) : (
                                <MapPin className="h-4 w-4 text-slate-400" />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={openLocationModal}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-[34px] px-3 text-xs font-semibold rounded bg-white text-navy border border-slate-300 hover:bg-ocean hover:text-white hover:border-ocean transition-all shadow-sm"
                        >
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Pilih Lokasi di Peta</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && <p className="text-xs text-danger mt-1">{error}</p>}

            {/* Modal Dialog for Interactive Map */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/50">
                            <div>
                                <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-ocean" />
                                    Tentukan Titik Koordinat Usaha
                                </h3>
                                <p className="text-xs text-slate mt-0.5">
                                    Geser pin atau klik langsung pada peta untuk menetapkan koordinat lokasi usaha perikanan Anda.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Map Container */}
                        <div className="relative">
                            <div ref={mapContainerRef} className="h-[380px] w-full z-0 bg-slate-100" />

                            {/* Floating Controls on Map */}
                            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    disabled={isLocating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-xs font-semibold text-navy shadow-md hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
                                >
                                    {isLocating ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                                    ) : (
                                        <Crosshair className="h-3.5 w-3.5 text-ocean" />
                                    )}
                                    <span>Gunakan GPS Saya</span>
                                </button>
                            </div>

                            {/* Coordinate Ribbon at Bottom of Map */}
                            <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200 shadow-md flex items-center gap-3 text-xs">
                                <div>
                                    <span className="text-slate-400 font-medium">Lintang (Lat): </span>
                                    <span className="font-mono font-bold text-navy">{tempCoords.lat.toFixed(6)}</span>
                                </div>
                                <div className="h-3 w-px bg-slate-300" />
                                <div>
                                    <span className="text-slate-400 font-medium">Bujur (Lng): </span>
                                    <span className="font-mono font-bold text-navy">{tempCoords.lng.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
                            <span className="text-xs text-slate-500 italic">
                                *Pin dapat digeser ke lokasi presisi tambak, dermaga, atau sentra olahan Anda.
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyLocation}
                                    className="px-5 py-2 text-xs font-semibold rounded-md bg-ocean text-white hover:bg-navy transition-colors inline-flex items-center gap-1.5 shadow-sm"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Terapkan Lokasi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
