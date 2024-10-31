import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  border: '2px solid rgba(132, 233, 233, 0.8)', // Los valores CSS deben estar en formato de string
};


// Coordenadas por defecto para La Paz, Bolivia
const DEFAULT_POSITION = { lat: -16.5000, lng: -68.1193 };

const MapComponent = ({ markerPosition, onUpdateMarkerPosition }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyC1F5Dxe-gctQQtzj_xpj4wLHJbs66Vi0M', // Reemplaza con tu clave API
    libraries: ['places'],
  });

  const [placeDetails, setPlaceDetails] = useState(null); 
  const currentLat = parseFloat(markerPosition.lat) || DEFAULT_POSITION.lat;
  const currentLng = parseFloat(markerPosition.lng) || DEFAULT_POSITION.lng;
  
  // Función para obtener detalles del lugar
  const fetchPlaceDetails = useCallback((placeId) => {
    if (window.google) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(place);
       //   console.log('Detalles del lugar:', place);
        } else {
         // console.error('Error fetching place details:', status);
        }
      });
    }
  }, []);

  // Efecto para buscar detalles del lugar cuando cambia la posición del marcador
  useEffect(() => {
    if (isLoaded) {
      const request = {
        location: new window.google.maps.LatLng(currentLat, currentLng),
        radius: '20', // Radio de búsqueda en metros
        type: ['point_of_interest'], // Cambiar según sea necesario
      };

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          const placeId = results[0].place_id; // Usa el primer resultado
          fetchPlaceDetails(placeId);
        } else {
       //   console.error('Error fetching places:', status);
        }
      });
    } else {
    //  console.error("Google Maps API is not loaded yet");
    }
  }, [isLoaded, currentLat, currentLng, fetchPlaceDetails]);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    onUpdateMarkerPosition({ lat, lng }); // Actualiza la posición del marcador
  }, [onUpdateMarkerPosition]);

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
  <div className="place-details-container">
  {placeDetails ? (
    <div>
      <p >
        <strong>{placeDetails.name}</strong>
      </p>
      <p >{placeDetails.formatted_address}</p>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${placeDetails.geometry.location.lat()},${placeDetails.geometry.location.lng()}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none' }} // Estilo del enlace
      >
        Cómo Llegar
      </a>
    </div>
  ) : (
    <p style={{ fontSize: '12px' }}>Loading place details...</p>
  )}
</div>



      {/* Mapa de Google */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: currentLat,
          lng: currentLng,
        }}
        zoom={15}
        onClick={handleMapClick} // Maneja el clic en el mapa
      >
        <Marker 
          position={{
            lat: currentLat,
            lng: currentLng,
          }}
        />
      </GoogleMap>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default React.memo(MapComponent);
