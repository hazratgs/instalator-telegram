const db = require('../../mongodb')

// Source Scheme
const SourceSchema = new db.mongoose.Schema({
  name: { type: String, required: [true, 'nameRequired'] },
  source: { type: Array, required: [true, 'dataRequired'] },
  count: { type: Number },
  date: { type: Date, default: Date.now() }
})

exports.Source = db.connect.model('Source', SourceSchema)
