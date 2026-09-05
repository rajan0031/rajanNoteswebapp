import mongoose from 'mongoose';

let connection;

const visitSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Visit = mongoose.models.Visit || mongoose.model('Visit', visitSchema);

export default async () => {
  try {
    if (!process.env.MONGODB_URI) {
      return response(500, { error: 'MONGODB_URI is not configured.' });
    }

    connection ??= mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'Note'
    });
    await connection;

    const visit = await Visit.findOneAndUpdate(
      { key: 'question-bank' },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return response(200, { count: visit.count });
  } catch (error) {
    console.error('Visit counter error:', error);
    return response(500, { error: 'Unable to record visit.' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
