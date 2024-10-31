import { gql } from '@apollo/client';

const createProfile = gql`
  mutation createProfile(
    $serial: String!,
    $userId: ID!,
    $name: String!,
    $photo_profile: String!,
    $photo_portada: String!,
    $fecha_nacimiento: String!,
    $fecha_fallecimiento: String!,
    $lugar_nacimiento: String!,
    $lugar_fallecimiento: String!,
    $epitafio: String!,
    $biografia: String!,
    $lat: String,
    $lng: String,
    $direccion: String,
  ) {
    createProfile(
      serial: $serial,
      userId: $userId,
      name: $name,
      photo_profile: $photo_profile,
      photo_portada: $photo_portada,
      fecha_nacimiento: $fecha_nacimiento,
      fecha_fallecimiento: $fecha_fallecimiento,
      lugar_nacimiento: $lugar_nacimiento,
      lugar_fallecimiento: $lugar_fallecimiento,
      epitafio: $epitafio,
      biografia: $biografia,
      lat: $lat,
      lng: $lng,
      direccion: $direccion,
    ) {
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
      lat
      lng
      direccion
      expirateAt
      code_qr
      status
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


const updateProfile = gql`
  mutation updateProfile($profile: ProfileUpdate!) {
    updateProfile(profile: $profile) {
      profileId
      name
      photo_profile
    }
  }
`;

const deleteProfile = gql`
  mutation deleteProfile($profileId: ID!) {
    deleteProfile(profileId: $profileId)
  }
`;

export { createProfile, updateProfile, deleteProfile };
