import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface BusinessLocationMapProps {
    latitude: number | null | undefined;
    longitude: number | null | undefined;
    businessName: string;
    address?: string | null;
}

export default function BusinessLocationMap({
    latitude,
    longitude,
    businessName,
    address,
}: BusinessLocationMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const hasCoords =
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !isNaN(latitude) &&
        !isNaN(longitude);

    useEffect(() => {
        if (!hasCoords || !mapContainerRef.current) return;

        // Custom NSA Map Pin Icon
        const pinIcon = L.divIcon({
            className: 'nsa-map-marker',
            html: `
                <div style="position: relative; width: 34px; height: 44px; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(1, 64, 129, 0.35));">
                    <svg viewBox="0 0 24 32" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.5 12 32 12 32C12 32 24 20.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#014081"/>
                        <circle cx="12" cy="11" r="5" fill="#3AD1F3"/>
                    </svg>
                </div>
            `,
            iconSize: [34, 44],
            iconAnchor: [17, 44],
            popupAnchor: [0, -40],
        });

        // Initialize Map
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [latitude as number, longitude as number],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c'],
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const marker = L.marker([latitude as number, longitude as number], {
                icon: pinIcon,
            }).addTo(map);

            marker.bindPopup(`
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 4px;">
                    <strong style="color: #014081; font-size: 13px;">${businessName}</strong><br/>
                    <span style="color: #64748b;">${address || 'Lokasi Usaha Terdaftar'}</span><br/>
                    <small style="font-family: monospace; color: #056ed4;">${latitude}, ${longitude}</small>
                </div>
            `);

            mapInstanceRef.current = map;
            markerRef.current = marker;
        } else {
            mapInstanceRef.current.setView([latitude as number, longitude as number], 14);
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude as number, longitude as number]);
            }
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [latitude, longitude, businessName, address, hasCoords]);

    const googleMapsUrl = hasCoords
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : null;

    if (!hasCoords) {
        return (
            <div className="rounded-xl border border-line bg-mist/50 p-6 text-center">
                <MapPin className="mx-auto h-8 w-8 text-slate/40 mb-2" />
                <p className="text-sm font-semibold text-navy">Koordinat GPS Belum Disetel</p>
                <p className="text-xs text-slate mt-0.5">
                    Pemohon belum menandai titik lokasi peta usaha secara spesifik.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-slate">
                    <Navigation className="w-3.5 h-3.5 text-ocean" />
                    <span>Lat: {latitude?.toFixed(6)}</span>
                    <span className="text-slate/40">&bull;</span>
                    <span>Lng: {longitude?.toFixed(6)}</span>
                </div>
                {googleMapsUrl && (
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-royal-blue hover:text-navy font-semibold transition"
                    >
                        Buka di Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-line shadow-soft">
                <div
                    ref={mapContainerRef}
                    className="h-64 w-full bg-slate-100 z-0"
                    style={{ minHeight: '256px' }}
                />
            </div>
        </div>
    );
}
