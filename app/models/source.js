let db = require('../../libs/db')

// Схема источника
let SourceSchema = new db.mongoose.Schema({
  name: { type: String, required: [true, 'nameRequired'] },
  source: { type: Array, required: [true, 'dataRequired'] },
  count: { type: Number }
})

exports.Source = db.connect.model('Source', SourceSchema)
