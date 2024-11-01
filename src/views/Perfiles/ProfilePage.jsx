import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import videoBg from '../../assets/video/video3.mp4'; // Video de fondo
import { useParams } from 'react-router-dom';
import { getProfile } from '../../graphql/perfiles/graphql.queries';
import { incrementVisits } from '../../graphql/visitas/graphql.mutation';
import PhotoGallery from './PhotoGallery';
import './Video-Background.css';
import MapComponent from './MapComponent'; // Importa el componente donde sea necesario



const ProfilePage = () => {
  const { profileId } = useParams();
  const [loadingx, setLoadingx] = useState(true);
  const [hideLoadingScreen, setHideLoadingScreen] = useState(false);
  const { data, loading, error } = useQuery(getProfile, {
    variables: { profileId: profileId },
  });
  const [incrementVisitsMutation] = useMutation(incrementVisits);
  const [isModalOpen, setModalOpen] = useState(false); // Estado para manejar el modal
  const [isQrModalOpen, setQrModalOpen] = useState(false); // Estado para manejar el modal del QR


  useEffect(() => {
    // Asegúrate de que el profileId esté disponible antes de ejecutar la mutación
    if (profileId) {
      incrementVisitsMutation({
        variables: { profileId: profileId }
      })
        .then(response => {
          // console.log('Visita incrementada', response.data);
        })
        .catch(err => {
          //  console.error('Error incrementando la visita:', err);
        });
    }
  }, [profileId, incrementVisitsMutation]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingx(false);
      setTimeout(() => setHideLoadingScreen(true), 1000); // Tiempo adicional para la animación
    }, 5000
    ); // 5 segundos de pantalla de carga
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img
          src="https://c.tenor.com/8KWBGNcD-zAAAAAC/loader.gif"
          alt="Cargando..."
          style={{ width: '100px', height: '100px' }} // Ajusta el tamaño de la imagen de loading
        />
      </div>
    );
  }



  if (error) return <p>Error: {error.message}</p>;

  const profile = data?.getProfile;

  if (!profile?.serial?.vigente) {
    return <p>Este perfil no está disponible.</p>;
  }

  const markerPosition = {
    lat: parseFloat(profile.lat),
    lng: parseFloat(profile.lng),
  };

  const handleHeaderClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleQrClick = () => {
    setQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
  };

  return (
    <>
      {/* Plumas cayendo como fondo */}
      <div className="feather"></div>
      <div className="feather"></div>
      <div className="feather"></div>
      <div className="feather"></div>
      <div className="feather"></div>
      <div class="loader"></div>

      {/* Mostrar la pantalla de carga si no está oculta */}
      {!hideLoadingScreen && profile && (
        <div className={`loading-screen ${!loadingx ? "fade-out" : ""}`}>
          <video autoPlay muted loop className="background-video">
            <source src={videoBg} type="video/mp4" />
          </video>
          <div className="overlay-text">En memoria de</div>
          <div className="overlay-text-bottom">{profile.name}</div>
          <div className="overlay">

            <div className="profile-intro" onClick={(e) => e.stopPropagation()}> {/* Detiene la propagación del evento */}

              <img className='borderimg' src={profile.photo_profile} alt="Perfil" />

            </div>

          </div>
        </div>
      )}

      {/* Mostrar la página del perfil */}
      <div className="profile-page">
        <div className="cover-container" style={{ backgroundImage: `url(${profile.photo_portada})` }} onClick={handleHeaderClick}>
          <div className="profile-picture" onClick={(e) => e.stopPropagation()}> {/* Detiene la propagación del evento */}
            <img src={profile.photo_profile} alt="Foto de Perfil" />
          </div>
        </div>



        <div className="profile-info ">
          <div className="feather"></div>
          <div className="feather"></div>
          <div className="feather"></div>
          <div className="feather"></div>
          <div className="feather"></div>
          <div className="qr-section" onClick={handleQrClick}>
            <img src={profile.code_qr} alt="Código QR" />
          </div>

          <h1>{profile.name}</h1>
          <h2>"{profile.epitafio}"</h2>
          <div className="dates">
            <p><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="text-gray-700 dark:text-white"
              width="20"
              height="20"
            >
              <polygon
                points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8"
                fill="currentColor"
              />
            </svg><strong>Nació en:  </strong> {profile.lugar_nacimiento}, {profile.fecha_nacimiento}</p>
            <p><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" class="mr-2 text-center text-gray-700 dark:text-white" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M6.1 444.3c-9.6 10.8-7.5 27.6 4.5 35.7l68.8 27.9c9.9 6.7 23.3 5 31.3-3.8l91.8-101.9-79.2-87.9-117.2 130zm435.8 0s-292-324.6-295.4-330.1c15.4-8.4 40.2-17.9 77.5-17.9s62.1 9.5 77.5 17.9c-3.3 5.6-56 64.6-56 64.6l79.1 87.7 34.2-38c28.7-31.9 33.3-78.6 11.4-115.5l-43.7-73.5c-4.3-7.2-9.9-13.3-16.8-18-40.7-27.6-127.4-29.7-171.4 0-6.9 4.7-12.5 10.8-16.8 18l-43.6 73.2c-1.5 2.5-37.1 62.2 11.5 116L337.5 504c8 8.9 21.4 10.5 31.3 3.8l68.8-27.9c11.9-8 14-24.8 4.3-35.6z"></path></svg><strong>Falleció en:  </strong> {profile.lugar_fallecimiento}, {profile.fecha_fallecimiento}</p>
          </div>

          <div className="biography">
            <h2>Biografía</h2>
            <p>{profile.biografia}</p>
          </div>
        </div>


        <div className="gallery">
          <h2>Galeria de fotos</h2>
          <PhotoGallery listaImagenes={profile.gallery?.listaMultimediaFilesUrls} />
        </div>

        <div className="address-container">
          <div className="address">
            <h2>Dirección</h2>
            <p>{profile.direccion}</p>
            <div className="map-container">

              <MapComponent markerPosition={markerPosition} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para maximizar la imagen de portada */}
      {isModalOpen && (
        <div className="modal" onClick={handleCloseModal}>
          <img src={profile.photo_portada} alt="Portada Maximizada" />
          <div className="modal-close" onClick={handleCloseModal}>✖</div>
        </div>
      )}

      {/* Modal para maximizar el código QR */}
      {isQrModalOpen && (
        <div className="modal" onClick={handleCloseQrModal}>
          <p className="qr-modal-text">{profile.name}</p>
          <div className="qr-section">
            <img src={profile.code_qr} alt="Código QR Maximizado" />
          </div>
          <p className="qr-modal-text">www.angelmemoriesbo.com</p>
          <div className="modal-close" onClick={handleCloseQrModal}>✖</div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Contáctanos para obtener un perfil <a href="https://www.angelmemoriesbo.com" target="_blank" rel="noopener noreferrer">Click Aquí</a></p>
        </div>
      </footer>

    </>
  );
};

export default ProfilePage;
