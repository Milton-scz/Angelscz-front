import { gql } from '@apollo/client';

const incrementVisits = gql`
  mutation incrementVisit($profileId: ID!) {
    incrementVisit(profileId: $profileId){
        profile{
          profileId
          }
      visitCount
     }
      }
`;





export { incrementVisits };
