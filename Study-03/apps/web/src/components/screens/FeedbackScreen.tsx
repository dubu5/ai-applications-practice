import { useEffect, useState } from 'react';
import { Question } from '../../features/quiz/types';
import { ShuffledQuestion } from '../../features/quiz/quizEngine';
import Button from '../common/Button';

interface FeedbackScreenProps {
  question: Question | ShuffledQuestion;
  selectedIndex: number;
  isCorrect: boolean;
  score: number;
  onNext: () => void;
}

const FeedbackScreen = ({
  question,
  selectedIndex,
  isCorrect,
  score,
  onNext,
}: FeedbackScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen p-4 flex items-center justify-center transition-all ${
        isCorrect ? 'bg-gradient-to-b from-green-50 to-green-100' : 'bg-gradient-to-b from-red-50 to-red-100'
      }`}
    >
      <div className="max-w-2xl w-full">
        {/* Result Badge */}
        <div className={`text-center mb-8 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all`}>
          <div
            className={`inline-block text-7xl mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
          >
            {isCorrect ? '✓' : '✗'}
          </div>
          <h2
            className={`text-3xl font-bold mb-2 ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isCorrect ? '정답입니다!' : '오답입니다!'}
          </h2>
          <p className={`text-xl font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {score}점
          </p>
        </div>

        {/* Details */}
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all`}>
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">문제</h3>
            <p className="text-gray-700">{question.question}</p>
          </div>

          {/* Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">선택지</h3>
            <div className="space-y-2">
              {question.choices.map((choice, index) => {
                const isAnswerChoice = index === (question as any).currentAnswerIndex || index === question.answerIndex;
                const isSelectedChoice = index === selectedIndex;

                let bgClass = 'bg-gray-50';
                let textClass = 'text-gray-700';

                if (isAnswerChoice && isSelectedChoice && isCorrect) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-green-700 font-bold';
                } else if (isAnswerChoice && !isCorrect) {
                  bgClass = 'bg-green-100';
                  textClass = 'text-green-700 font-bold';
                } else if (isSelectedChoice && !isCorrect) {
                  bgClass = 'bg-red-100';
                  textClass = 'text-red-700 font-bold';
                }

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 border-gray-200 ${bgClass} ${textClass}`}
                  >
                    <span className="font-bold mr-2">({index + 1})</span>
                    {choice}
                    {isAnswerChoice && <span className="ml-2">✓ 정답</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">해설</h3>
            <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full text-lg font-bold"
        >
          다음 문제
        </Button>
      </div>
    </div>
  );
};

export default FeedbackScreen;
