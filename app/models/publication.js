const db = require('../../libs/db')

// Модель отложенной записи
const PublicationSchema = new db.mongoose.Schema({
  user: { type: Number, required: [true, 'userRequired'] },
  login: { type: String, required: [true, 'loginRequired'] },
  title: { type: String, required: [true, 'titleRequired'] },
  date: { type: Date, required: [true, 'dateRequired'] },
  image: { type: String, required: [true, 'imageRequired'] }
})

exports.Publication = db.connect.model('Publication', PublicationSchema)
