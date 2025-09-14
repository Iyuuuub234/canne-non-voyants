import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Coordonnées d'Agadir, Maroc
    const agadirPosition: [number, number] = [30.427755, -9.598107];

    if (!isMounted) {
        return <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">Chargement de la carte...</div>;
    }

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden">
            <MapContainer
                center={agadirPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={agadirPosition}>
                    <Popup>
                        Agadir, Maroc
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;