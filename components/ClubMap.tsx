import React, { useEffect, useRef, useState } from 'react';
import { Club } from '../types';

interface ClubMapProps {
    clubs: Club[];
    center: { lat: number; lng: number };
    radius: number | null;
    onSelectClub: (club: Club) => void;
}

const ClubMap: React.FC<ClubMapProps> = ({ clubs, center, radius, onSelectClub }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [radiusCircle, setRadiusCircle] = useState<google.maps.Circle | null>(null);

    // Initialize Map
    useEffect(() => {
        if (mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 12,
                disableDefaultUI: true,
                styles: [ // Dark theme for the map
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                      featureType: "administrative.locality",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "poi",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "geometry",
                      stylers: [{ color: "#263c3f" }],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#6b9a76" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#38414e" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#212a37" }],
                    },
                    {
                      featureType: "road",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry",
                      stylers: [{ color: "#746855" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#1f2835" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#f3d19c" }],
                    },
                    {
                      featureType: "transit",
                      elementType: "geometry",
                      stylers: [{ color: "#2f3948" }],
                    },
                    {
                      featureType: "transit.station",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#17263c" }],
                    },
                    {
                      featureType: "water",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#515c6d" }],
                    },
                    {
                      featureType: "water",
                      elementType: "labels.text.stroke",
                      stylers: [{ color: "#17263c" }],
                    },
                  ]
            });
            setMap(newMap);
        }
    }, [mapRef, map, center]);
    
    // Update map center and radius circle
    useEffect(() => {
        if(map) {
            map.panTo(center);
            
            if (radiusCircle) {
                radiusCircle.setMap(null);
            }
            if (radius) {
                 const newCircle = new window.google.maps.Circle({
                    strokeColor: "#62b1f3",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#62b1f3",
                    fillOpacity: 0.1,
                    map,
                    center: center,
                    radius: radius * 1000, // radius in meters
                });
                setRadiusCircle(newCircle);
            }
        }
    }, [map, center, radius]);


    // Update Markers
    useEffect(() => {
        if (map) {
            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            
            const newMarkers = clubs.map(club => {
                const marker = new window.google.maps.Marker({
                    position: { lat: club.lat, lng: club.lng },
                    map,
                    title: club.name,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#3895d6",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                    }
                });
                marker.addListener('click', () => onSelectClub(club));
                return marker;
            });

            setMarkers(newMarkers);
        }
    }, [map, clubs, onSelectClub]);

    return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '1rem' }} />;
};

export default ClubMap;