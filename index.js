require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const Contact = require('./models/contact')

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

morgan.token('req-body', (req) => {
  return JSON.stringify(req.body);
});

morgan.token('customStatus', (req, res) => {
  if (res.statusCode.toString() === "200") {
    return "200 OK!";
  } else if (res.statusCode.toString() === "400") {
    return "400 ERROR!";
  } else {
    return res.statusCode.toString();
  }
});

app.use(morgan(':method :url :customStatus :res[content-length] - :response-time ms :req-body'));


let persons = []

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
      


app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>\n<p>${Date()}</p>`)
    })


app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})


app.get('/api/persons/:id', (request, response) => {
  Contact.findById(request.params.id).then(contact => {
    response.json(contact)
  })
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


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }
  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  })

  contact.save().then(savedContact => {
    response.json(savedContact)
  })
})



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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})