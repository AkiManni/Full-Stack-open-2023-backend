require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const Contact = require('./models/contact')

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

// had to get rid of this, since somehow it constantly kept trying to GET it eventhough it is non-existent in the backend
app.use('/favicon.ico', (req, res) => {
  res.status(204).end();
});

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

app.get('/info', async (request, response) => {
    response.send(`<p>Phonebook has info for ${await Contact.countDocuments({})} people</p>\n<p>${Date()}</p>`)
    })


app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
  .then(
    contact => {
    if(contact){
      response.json(contact)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => 
    next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (body.name === undefined) {
  return response.status(400).json({ error: 'name missing' })
  }
  if (body.number === undefined) {
  return response.status(400).json({ error: 'number missing' })
  }

  Contact.findOne({ name: body.name })
    .then(existingContact => {
      if (existingContact) {
        Contact.findByIdAndUpdate(
          existingContact.id,
          { number: body.number },
          { new: true }
        )
          .then(savedContact => {
            response.json(savedContact);
          })
          .catch(error => next(error));
      } else {
        const contact = new Contact({
          name: body.name,
          number: body.number
        });
    
        contact
          .save()
          .then(savedContact => {
            response.json(savedContact);
          })
          .catch(error => next(error));
      }
    })
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Error handlings:
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

// !! Must be registered after every other middlewares
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})