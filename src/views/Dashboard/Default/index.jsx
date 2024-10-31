import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client'; 

// Material-UI
import { useTheme, styled } from '@mui/material/styles';
import { Grid, Card, CardHeader, CardContent, Typography, Divider, LinearProgress } from '@mui/material';

// Project imports
import SalesLineCard from 'views/Dashboard/card/SalesLineCard';
import SalesLineCardData from 'views/Dashboard/card/sale-chart-1';
import RevenuChartCard from 'views/Dashboard/card/RevenuChartCard';
import RevenuChartCardData from 'views/Dashboard/card/revenu-chart';
import ReportCard from './ReportCard';
import { gridSpacing } from 'config.js';
import { getProfiles } from 'graphql/perfiles/graphql.queries';
import { getAllSerials } from 'graphql/serials/graphql.queries';
import { getTotalVisits } from 'graphql/visitas/graphql.queries';
import {
  MonetizationOnTwoTone,
  CalendarTodayTwoTone,
  ThumbUpAltTwoTone,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbDownIcon from '@mui/icons-material/ThumbDown'; // Importa el icono de pulgar abajo
// Custom styles
const FlatCardBlock = styled((props) => <Grid item sm={6} xs={12} {...props} />)(({ theme }) => ({
  padding: '25px 25px',
  borderLeft: '1px solid' + theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    borderLeft: 'none',
    borderBottom: '1px solid' + theme.palette.background.default,
  },
  [theme.breakpoints.down('md')]: {
    borderBottom: '1px solid' + theme.palette.background.default,
  },
}));

// ==============================|| DASHBOARD DEFAULT ||============================== //

const Default = () => {
  const theme = useTheme();
  const [totalProfiles, setTotalProfiles] = useState(0); // Total de perfiles
  const [totalSerials, setTotalSerials] = useState(0); // Total de perfiles
  const [totalActivos, setTotalProfilesActivos] = useState(0); // Total de perfiles activos
  const [totalInactivos, setTotalProfilesInactivos] = useState(0); // Total de perfiles inactivos
  const [totalVisitas, setTotalVisitas] = useState(0); // Total de visitas

  // Consultas de GraphQL
  const { loading: loadingProfiles, error: errorProfiles, data: dataProfiles } = useQuery(getProfiles, {
    variables: { page:0, size: 10 },
  });

  const { loading: loadingSerials, error: errorSerials, data: dataSerials } = useQuery(getAllSerials, {
  });

  const { loading: loadingVisits, error: errorVisits, data: dataVisits } = useQuery(getTotalVisits);

  // Manejo de datos de perfiles
  useEffect(() => {
    if (dataProfiles && dataSerials) {
      const profiles = dataProfiles.getProfiles.items;
      const serials = dataSerials.getAllSerials || []; // Asegúrate de inicializar como arreglo
      const totalElementos = dataProfiles.getProfiles.pageInfo.totalElementos;
  
      const totalActivos = serials.filter(serial => serial.vigente).length;
      const totalInactivos = serials.filter(serial => !serial.vigente).length;
  
      // Actualizar el estado
      setTotalProfiles(totalElementos);
      setTotalProfilesActivos(totalActivos);
      setTotalProfilesInactivos(totalInactivos);
    }
  }, [dataProfiles, dataSerials]); // Agrega dataSerials como dependencia

  // Manejo de datos de visitas
  useEffect(() => {
    if (dataVisits) {
      setTotalVisitas(dataVisits.getTotalVisits); // Actualiza el estado de totalVisitas
    }
  }, [dataVisits]);

  // Manejo de carga y errores
  if (loadingProfiles || loadingVisits) return <p>Loading...</p>;
  if (errorProfiles) return <p>Error en Perfiles: {errorProfiles.message}</p>;
  if (errorVisits) return <p>Error en Visitas: {errorVisits.message}</p>;

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={3} sm={6} xs={12}>
            <ReportCard
              primary={totalProfiles}
              secondary="Total Perfiles"
              color={theme.palette.warning.main}
              footerData="10% cambios en ganancias"
              iconPrimary={MonetizationOnTwoTone}
              iconFooter={TrendingUpIcon}
            />
          </Grid>
          <Grid item lg={3} sm={6} xs={12}>
            <ReportCard
              primary={totalVisitas}
              secondary="Total Visitas"
              color={theme.palette.primary.main}
              footerData="28% rendimiento de visitas"
              iconPrimary={VisibilityIcon}
              iconFooter={TrendingDownIcon}
            />
          </Grid>
          <Grid item lg={3} sm={6} xs={12}>
            <ReportCard
              primary={totalActivos}
              secondary="Perfiles Activos"
              color={theme.palette.success.main}
              footerData="10k visitas diarias"
              iconPrimary={ThumbUpAltTwoTone}
              iconFooter={TrendingUpIcon}
            />
          </Grid>
          <Grid item lg={3} sm={6} xs={12}>
            <ReportCard
              primary={totalInactivos}
              secondary="Perfiles Inactivos"
              color={theme.palette.error.main}
              footerData="1k inactivos"
              iconPrimary={ThumbDownIcon}
              iconFooter={TrendingDownIcon}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={8} xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={gridSpacing}>
                  <Grid item xs={12}>
                    <SalesLineCard
                      chartData={SalesLineCardData}
                      title="Sales Per Day"
                      percentage="3%"
                      icon={<TrendingDownIcon />}
                      footerData={[
                        {
                          value: '$4230',
                          label: 'Total Revenue'
                        },
                        {
                          value: '321',
                          label: 'Today Sales'
                        }
                      ]}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <RevenuChartCard chartData={RevenuChartCardData} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} xs={12}>
            <Card>
              <CardHeader
                title={
                  <Typography component="div" className="card-header">
                    Traffic Sources
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={gridSpacing}>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item sm zeroMinWidth>
                        <Typography variant="body2">Direct</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" align="right">
                          80%
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" aria-label="direct" value={80} color="primary" />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item sm zeroMinWidth>
                        <Typography variant="body2">Social</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" align="right">
                          50%
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" aria-label="Social" value={50} color="secondary" />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item sm zeroMinWidth>
                        <Typography variant="body2">Referral</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" align="right">
                          20%
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" aria-label="Referral" value={20} color="primary" />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item sm zeroMinWidth>
                        <Typography variant="body2">Bounce</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" align="right">
                          60%
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" aria-label="Bounce" value={60} color="secondary" />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item sm zeroMinWidth>
                        <Typography variant="body2">Internet</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" align="right">
                          40%
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress variant="determinate" aria-label="Internet" value={40} color="primary" />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Default;
