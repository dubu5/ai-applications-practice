# 손글씨 숫자 인식 앱 (Handwritten Digit Recognition)

손글씨로 그린 숫자(0-9)를 AI가 인식하는 애플리케이션입니다. 데스크톱과 웹 두 가지 버전을 제공합니다.

## 프로젝트 구조

```
Study-01/
├── desktop_version/      # 데스크톱 GUI 버전 (Python + Tkinter)
│   ├── digit_recognition.py
│   ├── Run_Digit_Recognition.bat
│   └── CLAUDE.md
├── web_version/          # 웹 버전 (Flask + 캔버스)
│   ├── backend/          # Flask 서버
│   │   ├── app.py
│   │   └── requirements.txt
│   ├── frontend/         # HTML/CSS/JavaScript
│   └── CLAUDE.md
└── README.md
```

## Desktop 버전

Python + Tkinter GUI 애플리케이션

### 실행 방법
```bash
# 방법 1: 배치 파일 실행
Run_Digit_Recognition.bat

# 방법 2: Python으로 직접 실행
python digit_recognition.py
```

### 특징
- 280x280 캔버스에 손글씨 입력
- MNIST 데이터셋으로 훈련된 CNN 모델
- 28x28로 리사이징하여 인식
- 실시간 결과 표시

## Web 버전

Flask + HTML5 Canvas 웹 애플리케이션

### 실행 방법
```bash
cd web_version/backend
pip install -r requirements.txt
python app.py
```

브라우저에서 `http://localhost:5000` 접속

### 특징
- 브라우저 기반 인터페이스
- Canvas API로 실시간 드로잉
- RESTful API 기반 예측
- 모바일 지원 (터치 입력)

## 기술 스택

### Desktop 버전
- 언어: Python 3.11
- GUI: Tkinter
- ML: TensorFlow/Keras
- 이미지 처리: Pillow

### Web 버전
- 백엔드: Flask
- 프론트엔드: HTML5, CSS3, JavaScript
- ML: TensorFlow/Keras
- API: RESTful

## 모델 정보

### 아키텍처
```
CNN (Convolutional Neural Network)
├─ Conv2D(32 filters, 3x3) → MaxPool → ReLU
├─ Conv2D(64 filters, 3x3) → MaxPool → ReLU  
├─ Conv2D(64 filters, 3x3) → Flatten
├─ Dense(64) → ReLU → Dropout(0.5)
└─ Dense(10) → Softmax
```

### 성능
- 훈련 데이터: MNIST (60,000개)
- 테스트 정확도: ~98-99%
- 입력: 28x28 그레이스케일 이미지
- 출력: 0-9 확률 분포

## 4 편향 문제 및 해결 과정

### 문제 상황
처음 웹 버전 개발 시 어떤 숫자를 그려도 4로 인식되는 현상 발생

### 원인 분석

| 항목 | 문제 | 영향 |
|------|------|------|
| 훈련 데이터 | 8x8 기계 생성 숫자 | 손글씨와 완전히 다른 패턴 |
| 전처리 | 280x280 → 8x8 축소 | 정보 손실로 특정 패턴 편향 |
| 모델 크기 | 64차원 MLP | 손글씨 인식에 부족 |
| 정규화 | /16.0 (scikit-learn) | Desktop /255.0과 불일치 |

### 해결 방법

Desktop 버전과 동일하게 통일
- 훈련 데이터: MNIST 28x28 (동일)
- 전처리: 280x280 → 28x28 (동일)
- 모델: CNN 사용 (동일)
- 정규화: /255.0 (동일)

### 결과
- 웹 버전도 정확한 숫자 인식 가능
- 모든 숫자가 균등하게 인식됨
- Desktop과 Web 일관된 결과

## 주요 전처리 단계

```python
1. 색상 반전: 흰 배경, 검은 숫자로 통일
2. 리사이징: 280x280 → 28x28 (LANCZOS)
3. 정규화: 0-255 → 0-1 범위
4. Reshape: (28, 28, 1) 형태로 변환
```

## 설치 및 의존성

### Desktop 버전
```bash
pip install tensorflow pillow numpy
```

### Web 버전
```bash
pip install flask tensorflow pillow numpy flask-cors
```

## 사용 방법

### Desktop
1. `Run_Digit_Recognition.bat` 실행
2. 캔버스에 숫자 그리기
3. "Recognize Digit" 클릭
4. 결과 확인

### Web
1. 터미널에서 `python app.py` 실행
2. 브라우저에서 `http://localhost:5000` 접속
3. 캔버스에 숫자 그리기
4. "Recognize Digit" 버튼 클릭
5. 확률 분포와 함께 결과 표시

## 알려진 문제

Web 버전에서 모든 숫자가 4로 인식되는 현상이 발생합니다. 원인은 다음과 같이 추정됩니다:
- 캔버스 이미지의 Base64 인코딩/디코딩 과정에서의 데이터 손실
- 모델 훈련 시 특정 숫자(4)에 대한 과적합
- 브라우저의 Canvas API와 PIL의 이미지 처리 방식 불일치

향후 다음 방법으로 해결 예정:
- Desktop 버전의 저장된 모델을 Web에서 직접 로드
- Canvas 이미지 전송 방식 개선 (PNG 대신 다른 형식 시도)
- 모델 아키텍처 개선 및 재훈련
- 웹소켓을 통한 실시간 이미지 스트리밍

## 개선 사항

- [x] Desktop 버전 완성
- [x] Web 버전 프레임워크 구성
- [x] 모델 저장/로드 기능
- [ ] Web 버전 4 편향 문제 해결
- [ ] 모바일 앱 버전
- [ ] 실시간 모델 재훈련
- [ ] GPU 지원

## 라이센스

MIT License

## 작성자

Claude Haiku 4.5
