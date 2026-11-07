import { useState, useRef, useEffect } from 'react';
import { Question } from '../../features/quiz/types';
import { shuffleChoices, isCorrectAnswer } from '../../features/quiz/quizEngine';
import { calculateScore } from '../../features/quiz/scoreCalculator';
import Button from '../common/Button';
import Timer from '../common/Timer';
import ProgressBar from '../common/ProgressBar';

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentScore: number;
  onAnswerSubmit: (selectedIndex: number, isCorrect: boolean, score: number, timeRemainingMs: number) => void;
}

const QuizScreen = ({
  question,
  questionNumber,
  totalQuestions,
  currentScore,
  onAnswerSubmit,
}: QuizScreenProps) => {
  const [shuffledQuestion, setShuffledQuestion] = useState(shuffleChoices(question));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15000);
  const [isAnswered, setIsAnswered] = useState(false);
  const answerSubmittedRef = useRef(false);

  const handleTimeUp = () => {
    if (!answerSubmittedRef.current) {
      submitAnswer(null, 0);
    }
  };

  const submitAnswer = (selectedIdx: number | null, remainingTime: number) => {
    if (answerSubmittedRef.current) return;
    answerSubmittedRef.current = true;

    const isCorrect = selectedIdx !== null && isCorrectAnswer(selectedIdx, shuffledQuestion);
    const score = calculateScore(isCorrect, Math.max(0, remainingTime));

    setIsAnswered(true);
    setTimeout(() => {
      onAnswerSubmit(selectedIdx ?? 0, isCorrect, score, Math.max(0, remainingTime));
    }, 500);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || selectedIndex !== null) return;
    setSelectedIndex(index);
    submitAnswer(index, timeRemaining);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isAnswered || selectedIndex !== null) return;
    const key = parseInt(e.key);
    if (key >= 1 && key <= 4) {
      handleSelectOption(key - 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswered, selectedIndex, timeRemaining]);

  return (
    <div className="min-h-screen bg-gray-50 p-4" onKeyDown={handleKeyPress}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-gray-800">
              {questionNumber} / {totalQuestions}
            </div>
            <div className="text-lg font-bold text-blue-600">
              {currentScore}점
            </div>
          </div>
          <ProgressBar current={questionNumber} total={totalQuestions} showLabel={false} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Question */}
          <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {shuffledQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {shuffledQuestion.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={isAnswered || selectedIndex !== null}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all min-h-[44px] font-semibold text-lg ${
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                } ${isAnswered || selectedIndex !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                aria-pressed={selectedIndex === index}
                aria-label={`선택지 ${index + 1}: ${choice}`}
              >
                <span className="font-bold text-blue-600 mr-3">({index + 1})</span>
                {choice}
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600 mb-4">
            키보드: 1~4 키로 선택 가능
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer
            initialMs={15000}
            onTimeUp={handleTimeUp}
            onTick={setTimeRemaining}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
