import { gql } from '@apollo/client';

const getProfiles = gql`
  query getProfiles($page: Int!, $size: Int!) {
  getProfiles(page: $page, size: $size) {
        pageInfo {
            totalPaginas
            totalElementos
            paginaActual
            pageSize
        }
        items {
            profileId
            name
            photo_profile
            photo_portada
            fecha_nacimiento
            fecha_fallecimiento
            lugar_nacimiento
            lugar_fallecimiento
            epitafio
            biografia
            expirateAt
            code_qr
            lat
            lng
            direccion
            status
            gallery{
            galleryId
            listaMultimediaFilesUrls
            }
             serial {
                serialId
                serialCode
                duracion
                dias_restantes
                fecha_activacion
                fecha_finalizacion
                vigente
                activado
            }
        }
    }
  }
`;

 const getProfile = gql`
  query getProfile($profileId: String!) {
    getProfile(profileId: $profileId) {
        profileId
        name
        photo_profile
        photo_portada
        fecha_nacimiento
        fecha_fallecimiento
        lugar_nacimiento
        lugar_fallecimiento
        epitafio
        biografia
        expirateAt
        code_qr
        lat
        lng
        direccion
        status
        gallery{
        galleryId
        listaMultimediaFilesUrls
        }
         serial {
                serialId
                serialCode
                duracion
                dias_restantes
                fecha_activacion
                fecha_finalizacion
                vigente
                activado
            }
    }
  }
`;
export { getProfiles ,getProfile};
