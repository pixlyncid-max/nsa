import { cx } from '@/lib/cx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

interface ContactLocationMapProps {
    lat: number;
    lng: number;
    title: string;
    address: string;
    className?: string;
}

/**
 * Peta lokasi sekretariat NSA berbasis Leaflet dengan penanda kustom.
 * Memakai isolate z-0 agar layer kontrol Leaflet tetap berada di bawah navbar/drawer.
 */
export default function ContactLocationMap({
    lat,
    lng,
    title,
    address,
    className,
}: ContactLocationMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || Number.isNaN(lat) || Number.isNaN(lng)) {
            return;
        }

        const pinIcon = L.divIcon({
            className: 'nsa-contact-marker',
            html: `
                <div style="position: relative; width: 34px; height: 44px; transform: translate(-50%, -100%); filter: drop-shadow(0 3px 6px rgba(1, 64, 129, 0.45));">
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

        const map = L.map(containerRef.current, {
            center: [lat, lng],
            zoom: 15,
            scrollWheelZoom: false,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

        const popupWrap = document.createElement('div');
        popupWrap.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        popupWrap.style.fontSize = '12px';
        popupWrap.style.lineHeight = '1.45';
        popupWrap.style.color = '#0f172a';
        popupWrap.style.padding = '2px';

        const titleEl = document.createElement('strong');
        titleEl.style.color = '#014081';
        titleEl.style.display = 'block';
        titleEl.textContent = title;

        const addressEl = document.createElement('span');
        addressEl.style.color = '#475569';
        addressEl.textContent = address;

        popupWrap.appendChild(titleEl);
        popupWrap.appendChild(addressEl);
        marker.bindPopup(popupWrap);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [lat, lng, title, address]);

    return (
        <div
            className={cx(
                'relative isolate z-0 h-52 w-full overflow-hidden rounded-card border border-white/20 bg-navy/40',
                className
            )}
        >
            <div
                ref={containerRef}
                role="region"
                aria-label={`Peta lokasi ${title}`}
                className="h-full w-full"
            />
        </div>
    );
}
