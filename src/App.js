import React, { useEffect, useState } from 'react';
import { Routes ,Route } from 'react-router-dom';
import { Container, Typography, Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import axios from 'axios';

const TrainListPage = () => {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await axios.get('http://localhost:3000/train-schedule');
        setTrains(response.data);
      } catch (error) {
        console.error('Error fetching train schedule:', error);
      }
    };

    fetchTrains();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Train Schedule
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Train ID</TableCell>
              <TableCell>Train Name</TableCell>
              <TableCell>Departure Time</TableCell>
              <TableCell>Sleeper Price</TableCell>
              <TableCell>Sleeper Seats Availability</TableCell>
              <TableCell>AC Price</TableCell>
              <TableCell>AC Seats Availability</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains.map((train) => (
              <TableRow key={train.trainId}>
                <TableCell>{train.trainId}</TableCell>
                <TableCell>{train.trainName}</TableCell>
                <TableCell>{train.departureTime}</TableCell>
                <TableCell>{train.sleeper.price}</TableCell>
                <TableCell>{train.sleeper.seatsAvailability}</TableCell>
                <TableCell>{train.ac.price}</TableCell>
                <TableCell>{train.ac.seatsAvailability}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

const TrainDetailPage = ({ match }) => {
  const [train, setTrain] = useState(null);

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/train-schedule/${match.params.trainId}`);
        setTrain(response.data);
      } catch (error) {
        console.error('Error fetching train details:', error);
      }
    };

    fetchTrain();
  }, [match.params.trainId]);

  if (!train) {
    return null;
  }

  return (
    <Container>
      <Box mb={3}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Train Details
        </Typography>
      </Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Train ID: {train.trainId}
      </Typography>
      <Typography variant="h6" component="h3" gutterBottom>
        Train Name: {train.trainName}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Departure Time: {train.departureTime}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Sleeper Price: {train.sleeper.price}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Sleeper Seats Availability: {train.sleeper.seatsAvailability}
      </Typography>
      <Typography variant="body1" gutterBottom>
        AC Price: {train.ac.price}
      </Typography>
      <Typography variant="body1" gutterBottom>
        AC Seats Availability: {train.ac.seatsAvailability}
      </Typography>
    </Container>
  );
};

const App = () => {
  return (
    <Route>
      <Routes>
        <Route exact path="/" component={TrainListPage} />
        <Route path="/trains/:trainId" component={TrainDetailPage} />
      </Routes>
    </Route>
  );
};

export default App;
