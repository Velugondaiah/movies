const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
module.exports = app
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const initilizingServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}

initilizingServer()

const convertingTheKeys = obj => {
  return {
    movieName: obj.movie_name,
  }
}
const convertingTheKeyss = obj => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  }
}
//GET THE VALUES IN ARRAY
app.get('/movies/', async (request, response) => {
  const quarey1 = `
    SELECT 
    * 
    FROM
    movie
    ORDER BY movie_id
    `
  const result1 = await db.all(quarey1)
  response.send(result1.map(eachValue => convertingTheKeys(eachValue)))
})

//GET single obj

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const singleObj = `
  SELECT 
  *
   FROM 
   movie
  WHERE movie_id = ${movieId}
  `
  const queary2 = await db.get(singleObj)
  response.send(convertingTheKeyss(queary2))
})
// this is convert into director camel case
const convertCamelCase = obj => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  }
}

//get from director table in array
app.get('/directors/', async (request, response) => {
  const directorQueary = `
  SELECT
  *
  FROM
  director
  ORDER BY director_id;
  `
  const directorArray = await db.all(directorQueary)
  response.send(directorArray.map(each => convertCamelCase(each)))
})
// only name
const onlyName = obj => {
  return {
    movieName: obj.movie_name,
  }
}
// this is on both  cases lo unna vatini thesukoniravali
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorDetails = `
  SELECT 
  *
  FROM
  movie
  WHERE director_id = ${directorId}
  `
  const result3 = await db.all(directorDetails)
  response.send(result3.map(each => onlyName(each)))
})
// post to movie table
app.post('/movies/', async (request, response) => {
  const jsonResponse = request.body
  const {directorId, movieName, leadActor} = jsonResponse
  const quareyForCreate = `
  INSERT INTO
  movie (director_id , movie_name , lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  )
  `
  const resultOFPost = await db.run(quareyForCreate)
  response.send('Movie Successfully Added')
})

//put means update the value in the movie
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const addValues = request.body
  const {directorId, movieName, leadActor} = addValues
  const updateQuarey = `
  UPDATE 
  movie
  SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
  WHERE 
  movie_id = ${movieId}
  `
  await db.run(updateQuarey)
  response.send('Movie Details Updated')
})
// delect on movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})
