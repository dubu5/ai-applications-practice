import { useState, useRef } from 'react';
import Button from '../common/Button';
import { validateNickname, sanitizeNickname } from '../../features/quiz/scoreCalculator';

interface NicknameScreenProps {
  defaultNickname: string;
  onSubmit: (nickname: string) => void;
}

const NicknameScreen = ({ defaultNickname, onSubmit }: NicknameScreenProps) => {
  const [nickname, setNickname] = useState(defaultNickname);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (value: string) => {
    const sanitized = sanitizeNickname(value);
    setNickname(sanitized);
    setError('');
  };

  const handleSubmit = () => {
    if (!validateNickname(nickname)) {
      setError('닉네임은 2자 이상 12자 이하여야 합니다.');
      return;
    }
    onSubmit(nickname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          닉네임 입력
        </h2>

        <div className="mb-6">
          <label htmlFor="nickname" className="block text-lg font-semibold text-gray-700 mb-2">
            당신의 이름을 입력해주세요
          </label>
          <input
            ref={inputRef}
            id="nickname"
            type="text"
            value={nickname}
            onChange={e => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: 홍길동"
            maxLength={12}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500"
            autoFocus
            aria-label="닉네임 입력"
          />
          <p className="text-sm text-gray-600 mt-2">
            {nickname.length} / 12자
          </p>
          {error && (
            <p className="text-red-500 font-semibold mt-2">{error}</p>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          className="w-full text-lg font-bold"
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default NicknameScreen;
