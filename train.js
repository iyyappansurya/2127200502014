const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
// Middleware for authentication
const authenticate = async (req, res, next) => {
  try {
    const registerData = {
      companyName: "Trainy",
      clientID: "c18df44f-33fd-4227-b8c3-8a8b20b31126",
      clientSecret: "qxqrgAieJuFVZUsg",
      ownerName: "Iyyappan R",
      ownerEmail: "2020ad0615@svce.ac.in",
      rollNo: "2127200502014"
      // Other required details in the JSON payload
    };
    // Make a request to John Doe Railways' authentication API to obtain a new access code
    const registerResponse = await axios.post('http://104.211.219.98/train/register', requestData);
    const accessCode = registerResponse.data.access_token;
    console.log("hi");
    // Make a request to John Doe Railways' authentication API with the obtained access code
    const authResponse = await axios.post('http://104.211.219.98/train/auth', {
      accessCode: accessCode
    });

    if (authResponse.status === 200 && authResponse.data.authenticated) {
      req.accessCode = accessCode; // Store the access code in the request object
      next(); // Authentication successful
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// API endpoint to retrieve real-time train schedule
app.get('/train-schedule', authenticate, async (req, res) => {
  try {
    // Make a request to John Doe Railways' trains API
    const response = await axios.get('http://104.211.219.98/train/trains');
    const trains = response.data;

    // Filter out trains departing in the next 30 minutes
    const filteredTrains = trains.filter(train => {
      const departureTime = new Date(train.departureTime);
      const currentTime = new Date();
      const timeDifference = departureTime.getTime() - currentTime.getTime();
      const minutesDifference = timeDifference / (1000 * 60);
      return minutesDifference > 30;
    });

    // Calculate delays for each train
    const currentTime = new Date();
    const delayedTrains = filteredTrains.map(train => {
      const departureTime = new Date(train.departureTime);
      const delay = Math.floor(Math.random() * 60); // Random delay in minutes
      const delayedDepartureTime = new Date(departureTime.getTime() + delay * 60000);
      train.delayedDepartureTime = delayedDepartureTime.toISOString();
      return train;
    });

    // Sort the train schedule data
    const sortedTrains = delayedTrains.sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price; // Ascending order of price
      } else if (a.seatAvailability !== b.seatAvailability) {
        return b.seatAvailability - a.seatAvailability; // Descending order of ticket availability
      } else {
        return new Date(b.delayedDepartureTime) - new Date(a.delayedDepartureTime); // Descending order of departure time
      }
    });

    // Fetch seat availability and prices for each train coach type
    const trainsWithDetails = await Promise.all(sortedTrains.map(async train => {
      const response = await axios.get(`http://104.211.219.98/train/trains/${train.trainId}`);
      const trainDetails = response.data;
      train.sleeperPrice = trainDetails.sleeperPrice;
      train.sleeperSeatsAvailability = trainDetails.sleeperSeatsAvailability;
      train.acPrice = trainDetails.acPrice;
      train.acSeatsAvailability = trainDetails.acSeatsAvailability;
      return train;
    }));

    res.json(trainsWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
