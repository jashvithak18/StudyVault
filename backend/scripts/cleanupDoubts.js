import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env') });

// Inline Question and Answer models to avoid import chain issues
const QuestionSchema = new mongoose.Schema({
  title: String,
  content: String,
}, { strict: false });

const AnswerSchema = new mongoose.Schema({
  question: mongoose.Schema.Types.ObjectId,
  content: String,
}, { strict: false });

const Question = mongoose.model('Question', QuestionSchema, 'questions');
const Answer = mongoose.model('Answer', AnswerSchema, 'answers');

async function cleanupDoubts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find all questions that look like test data
    const testPatterns = [
      /test/i,
      /^sample/i,
      /^dummy/i,
      /lorem ipsum/i,
      /^hello/i,
      /^hi$/i,
    ];

    const allQuestions = await Question.find({});
    console.log(`Total questions in DB: ${allQuestions.length}`);

    const toDelete = allQuestions.filter(q =>
      testPatterns.some(pattern => pattern.test(q.title || '') || pattern.test(q.content || ''))
    );

    if (toDelete.length === 0) {
      console.log('No test doubts found to delete.');
    } else {
      console.log(`Found ${toDelete.length} test doubt(s) to delete:`);
      for (const q of toDelete) {
        console.log(`  - [${q._id}] "${q.title}"`);
      }

      const ids = toDelete.map(q => q._id);

      // Delete linked answers first
      const answersResult = await Answer.deleteMany({ question: { $in: ids } });
      console.log(`Deleted ${answersResult.deletedCount} linked answer(s).`);

      // Delete the questions themselves
      const questionsResult = await Question.deleteMany({ _id: { $in: ids } });
      console.log(`Deleted ${questionsResult.deletedCount} test question(s).`);
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanupDoubts();
