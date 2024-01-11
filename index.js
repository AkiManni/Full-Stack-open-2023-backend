const express = require('express')
const app = express()
const morgan = require('morgan')

morgan.token('req-body', (req) => {
  return JSON.stringify(req.body);
});

morgan.token('customStatus', (req, res) => {
  if(res.statusCode.toString() === "200"){
    return "200 OK!"
  }
  else if(res.statusCode.toString() === "400"){
    return "400 ERROR!"
  }
  else{
    return res.statusCode.toString();
  }
});

app.use(morgan(':method :url :customStatus :res[content-length] - :response-time ms :req-body'))
app.use(express.json())


let persons = [
      {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
      },
      {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
      },
      {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
      },
      {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
      }
    ]


app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>\n<p>${Date()}</p>`)
    })

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

/* app.get('/favicon.ico', (req, res) => {
  return
});
 */
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
      console.log(person.id, typeof person.id, id, typeof id, person.id === id)
      return person.id === id
    })
    console.log(person)
    if (person) {    
        response.json(person)  
    } 
    else {    
        response.status(404).end() 
        console.log("Person with id", id, "cannot be found")
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person =>{
      return person.id === id
    })
    if(person){
      persons = persons.filter(person => person.id !== id)
      response.status(204).end()
    }
    else{
      response.status(404).end()
      console.log("Person with id", id, "cannot be found")
    }
    
})

const generateId = () => {
  var maxId;
  do{
    maxId = Math.floor(Math.random() * 1000);
    }while(persons.some(person => {
      person.id === maxId
      }
    )
  )
  return maxId
}

/* const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
} */
  
app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if (!body.name) {
        return response.status(400).json({ 
        error: 'name missing' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }

    if (persons.find(person => person.name === body.name)){
        return response.status(400).json({ 
        error: 'name must be unique' 
        })
    }
    
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    
    persons = persons.concat(person)
    
    response.json(person)
    })

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})