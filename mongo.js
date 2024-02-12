const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as an argument')
  process.exit(1)
}

if (process.argv.length===4) {
  console.log('Please include number also as an argument')
  process.exit(1)
}

const password = process.argv[2]
const contactName = process.argv[3]
const contactNumber = process.argv[4]


const url =
  `mongodb+srv://fullstack:${password}@cluster0.b5m9ywg.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const contactInfoSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const ContactInfo = mongoose.model('Contact', contactInfoSchema)

if(process.argv.length===3){
  ContactInfo.find({}).then(result => {

    result.forEach((contactInfo, index) => {
      if (index === 0){
        console.log('\nphonebook:')
      }
      console.log(contactInfo.name, contactInfo.number, )
      if (index === result.length - 1) {
        console.log()
      }
    })
    mongoose.connection.close()
  })
}

if(process.argv.length === 5){
  const contactInfo = new ContactInfo({
    name: contactName,
    number: contactNumber,
  })

  // eslint-disable-next-line no-unused-vars
  contactInfo.save().then(result => {
    console.log('added ', process.argv[3], ' number ', process.argv[4], ' to phonebook')
    mongoose.connection.close()
  })
}
