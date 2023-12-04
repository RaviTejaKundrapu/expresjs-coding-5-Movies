const express = require('express')
const app = express()
module.exports = app
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    let port = 3000
    app.listen(port, () => {
      console.log(`... Server is Running in Port ${port} ...`)
    })
  } catch (error) {
    console.log(`Db Error: ${error.messsage}`)
    process.exit(1)
  }
}

initializeServerAndDb()

//API 1

//convert to camelcase

const movieObjectKeysToCamelcase = eachMovie => {
  return {
    movieName: eachMovie.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `SELECT * FROM movie`
  const api_1_InDb = await db.all(getAllMoviesQuery)
  response.send(api_1_InDb.map(each => movieObjectKeysToCamelcase(each)))
})

//API 2

app.post('/movies/', async (request, response) => {
  const detailsOfMovieToAdd = request.body
  const {directorId, movieName, leadActor} = detailsOfMovieToAdd
  const addMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//API 3

const objectToCamelCaseSearchedMovie = searchedMovie => {
  return {
    movieId: searchedMovie.movie_id,
    directorId: searchedMovie.director_id,
    movieName: searchedMovie.movie_name,
    leadActor: searchedMovie.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getSearchedMovieQuery = `SELECT * FROM movie where movie_id=${movieId}`
  const api_3_InDb = await db.get(getSearchedMovieQuery)
  response.send(objectToCamelCaseSearchedMovie(api_3_InDb))
})

// API 4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const detailsOfMovieToUpdate = request.body
  const {directorId, movieName, leadActor} = detailsOfMovieToUpdate
  const updateMovieQuery = `
  UPDATE movie
  SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API 5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE FROM movie where movie_id=${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 6

//convertDirectorDbKeysToCamelCase

let convertDirectorDbKeysToCamelCase = eachDirector => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director`
  const api_6_InDb = await db.all(getAllDirectorsQuery)
  response.send(api_6_InDb.map(each => convertDirectorDbKeysToCamelCase(each)))
})

//API 7

const movieObjectKeysToCamelcaseByDirectorId = eachMovie => {
  return {
    movieName: eachMovie.movie_name,
  }
}

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieByDirectorId = `SELECT * FROM movie WHERE director_id=${directorId};`
  const api_7_InDb = await db.all(getMovieByDirectorId)
  response.send(
    api_7_InDb.map(each => movieObjectKeysToCamelcaseByDirectorId(each)),
  )
})
