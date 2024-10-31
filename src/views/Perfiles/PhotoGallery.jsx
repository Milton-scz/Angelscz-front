import React, { useState } from 'react';
import { Carousel } from '3d-react-carousal';

const PhotoGallery = ({ listaImagenes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Estado para almacenar el índice actual

  // Generar imágenes para el carrusel con evento de clic
  const images = (listaImagenes || []).map((url, index) => (
    <img 
      src={url} 
      alt={`Slide ${index + 1}`} 
      key={index} 
      onClick={() => openModal(url, index)} // Al hacer clic, abre el modal con la imagen seleccionada
      style={{ cursor: 'pointer' }}
    />
  ));

  // Función para abrir el modal
  const openModal = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentIndex(index); // Almacenar el índice del slide seleccionado
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <>
      {images.length > 0 ? (
        <Carousel slides={images} />
      ) : (
        <p>No hay imágenes disponibles</p>
      )}

      {/* Modal para la imagen ampliada */}
      {isModalOpen && (
         <div className="modal" onClick={closeModal}>
         <img src={selectedImage} alt="Portada Maximizada" />
         <div className="modal-close" onClick={closeModal}>✖</div>
       </div>
      )}
    </>
  );
};

export default PhotoGallery;
