const db = require('../../mongodb')

// Model of the task
const TaskSchema = new db.mongoose.Schema({
  user: { type: Number, required: [true, 'userRequired'] },
  login: { type: String, required: [true, 'loginRequired'] },
  type: { type: String, required: [true, 'typeRequired'] },
  params: { type: Object, required: [true, 'paramsRequired'] }, // Array for storage specific to the data type
  status: { type: String, default: 'active' }, // Job status (active, cancel, success)
  date: { type: Date, default: Date.now },
  start: { type: Number, default: new Date().getMinutes(), required: [true, 'startReqiured'] } // minute start
})

exports.Task = db.connect.model('Task', TaskSchema)
