import { useState } from 'react';
import { CheckCircle2, Send, Loader2, Award } from 'lucide-react';
import api from '../utils/api';

const StudentQuestions = ({ lessonId, questions, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const currentQuestion = questions[currentStep];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim() || isValidating) return;

        try {
            setIsValidating(true);
            // Use the new AI evaluation endpoint
            const res = await api.post('/lessons/evaluate', {
                lessonId,
                answer
            });

            setFeedback(res.data.feedback);

        } catch (err) {
            console.error('Evaluation failed:', err);
            alert('Failed to evaluate answer. Please try again.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setAnswer('');
            setFeedback(null);
        } else  {
            onComplete();
        }
    };
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Lesson Assessment
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    Question {currentStep + 1} of {questions.length}
                </span>
            </div>

            <div className="p-6">
                {!feedback ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-700 font-medium text-lg leading-relaxed">
                            {currentQuestion.question}
                        </p>
                        <textarea
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[120px]"
                            placeholder="Provide your detailed answer here..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isValidating || !answer.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {isValidating ? (
                                <><Loader2 className="animate-spin w-5 h-5" /> Analyzing...</>
                            ) : (
                                <><Send className="w-5 h-5" /> Submit for AI Feedback</>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-gray-800">
                            <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                                <Award className="w-6 h-6" />
                                <span>AI Feedback</span>
                            </div>

                            {/* Displaying AI Markdown Feedback */}
                            <div className="prose prose-blue max-w-none whitespace-pre-wrap text-gray-700">
                                {feedback}
                            </div>

                            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-500 italic">
                                Feedback is learning assistance provided by AI, not official grading.
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition-all"
                        >
                            {currentStep < questions.length - 1 ? 'Next Question' : 'Finish & Unlock Progression'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentQuestions;
