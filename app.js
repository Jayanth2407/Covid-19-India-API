const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')
const db = new sqlite3.Database(dbPath)

// API 1: Get all states
app.get('/states/', (req, res) => {
  const getStatesQuery = `SELECT * FROM state;`
  db.all(getStatesQuery, [], (error, states) => {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.json(
        states.map(state => ({
          stateId: state.state_id,
          stateName: state.state_name,
          population: state.population,
        })),
      )
    }
  })
})

// API 2: Get a specific state by ID
app.get('/states/:stateId/', (req, res) => {
  const {stateId} = req.params
  const getStateQuery = `SELECT * FROM state WHERE state_id = ?;`
  db.get(getStateQuery, [stateId], (error, state) => {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.json({
        stateId: state.state_id,
        stateName: state.state_name,
        population: state.population,
      })
    }
  })
})

// API 3: Add a new district
app.post('/districts/', (req, res) => {
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  const addDistrictQuery = `
    INSERT INTO district (district_name, state_id, cases, cured, active, deaths)
    VALUES (?, ?, ?, ?, ?, ?);
  `
  db.run(
    addDistrictQuery,
    [districtName, stateId, cases, cured, active, deaths],
    function (error) {
      if (error) {
        res.status(500).send('Database Error')
      } else {
        res.send('District Successfully Added')
      }
    },
  )
})

// API 4: Get a specific district by ID
app.get('/districts/:districtId/', (req, res) => {
  const {districtId} = req.params
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ?;`
  db.get(getDistrictQuery, [districtId], (error, district) => {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.json({
        districtId: district.district_id,
        districtName: district.district_name,
        stateId: district.state_id,
        cases: district.cases,
        cured: district.cured,
        active: district.active,
        deaths: district.deaths,
      })
    }
  })
})

// API 5: Delete a district
app.delete('/districts/:districtId/', (req, res) => {
  const {districtId} = req.params
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ?;`
  db.run(deleteDistrictQuery, [districtId], function (error) {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.send('District Removed')
    }
  })
})

// API 6: Update a district
app.put('/districts/:districtId/', (req, res) => {
  const {districtId} = req.params
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  const updateDistrictQuery = `
    UPDATE district
    SET district_name = ?, state_id = ?, cases = ?, cured = ?, active = ?, deaths = ?
    WHERE district_id = ?;
  `
  db.run(
    updateDistrictQuery,
    [districtName, stateId, cases, cured, active, deaths, districtId],
    function (error) {
      if (error) {
        res.status(500).send('Database Error')
      } else {
        res.send('District Details Updated')
      }
    },
  )
})

// API 7: Get statistics for a state
app.get('/states/:stateId/stats/', (req, res) => {
  const {stateId} = req.params
  const getStatsQuery = `
    SELECT 
      SUM(cases) AS totalCases,
      SUM(cured) AS totalCured,
      SUM(active) AS totalActive,
      SUM(deaths) AS totalDeaths
    FROM district WHERE state_id = ?;
  `
  db.get(getStatsQuery, [stateId], (error, stats) => {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.json(stats)
    }
  })
})

// API 8: Get state name of a district
app.get('/districts/:districtId/details/', (req, res) => {
  const {districtId} = req.params
  const getStateNameQuery = `
    SELECT state.state_name AS stateName
    FROM district
    JOIN state ON district.state_id = state.state_id
    WHERE district.district_id = ?;
  `
  db.get(getStateNameQuery, [districtId], (error, result) => {
    if (error) {
      res.status(500).send('Database Error')
    } else {
      res.json(result)
    }
  })
})

// Export the app
module.exports = app
