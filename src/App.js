import React, { useCallback, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import styled from 'styled-components';
import { Helmet } from "react-helmet";

const EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise"];
const emotionLabels = {
  angry: '분노',
  disgust: '혐오',
  fear: '두려움',
  happy: '기쁨',
  sad: '슬픔',
  surprise: '놀람'
};

const emotionImages = {
  angry: 'https://i.namu.wiki/i/TiPeiVX03crD9UIcCZ3edz-xknhXkVHokJic-4iWTknGtg7njmHQGrdOHjxVzJGKrJSpWo6vYN-Qir7q8Z1kaP8qV13tmSk0h-FhO5yxmsPRIuj9WWvTJ8Jn99SLIrQfLpaCifFfsn1BHKtJ_N89xw.webp',
  disgust: 'https://i.namu.wiki/i/0FbYsOE9b_Csi9_KqbX-bU_4rXfjWIB3C-ovS6XVakA2dJfwe5uqfvUyX_bZUKq3PPzkGqM7aqiOK8kq8Njm0kFURTAGPnpo_GZMBZseEsXudgoiKvWhFU9rBsdf5_Srky6G3k8L34GTwIMMWXW0pw.webp',
  fear: 'https://i.namu.wiki/i/j_KLF5-C3-vtVDPhaDiDb-4GDJMNWrh8VIb2dnYvOPoOOfxvh-KCs0BYGmqbAfvIpP2p00NYr98Br7j4RIjyXTDNPKQLAaOwLL99V9UZsNNDZuH0xs3ZTtKzRVGTvI1BCtmeCxhQSORxxeT8cIUoiw.webp',
  happy: 'https://i.namu.wiki/i/n8K6xlXiVaqNFb70kC9EGj6JxlbbUbaOOSZnkS9vUGDE4h9G_ZwtJWaOIThGq5S9GTHTE28PV3Jle3jARNs99HUbPZu5ySAbVwicD_2E8w3ZTDKixkorliUFW4LTGgXjnESsRTSAWgnbB7WfakNtSQ.webp',
  sad: 'https://i.namu.wiki/i/GHK43pum9pAkFnvEsa1Qmooe0-bHOrxw7EgHccc68zPjGtjgxQIh7su0oFaVsI4WJQCS0c4-o_Y9tAGc8aVFEtQXKW_57Be6ha07mx2lK-oagva-4DmJFkdgBxgV5sjd6PXbiY2CJesYjKYhvz9EXA.webp',
  surprise: 'https://i.namu.wiki/i/znGSAu8SrTbRH7u39-rnSUTg6gdne_3CsL8Fz44S9sb7N0WdSByFU3hBJKSYEEP5gh-dT2VbseGMDHdPj49F2uJQi-E-eIqndqNd-JCm5nFamJcQqfbii_r9GZCyRTeC0fUIyxWgPabPL3404yMurg.webp'
};

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const LeftPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const WebcamContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const StyledWebcam = styled(Webcam)`
  width: 100%;
  height: auto;
`;

const EmotionBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
`;

const EmotionFill = styled.div`
  height: 100%;
  width: ${props => props.value * 100}%;
  background-color: ${props => props.color};
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const EmotionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  margin-bottom: 5px;
`;

const EmotionValue = styled.span`
  font-weight: bold;
`;

const TargetEmotion = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #e3f2fd;
  }
`;

const EmotionImage = styled.img`
  width: 100%;
  max-width: 150px;
  border-radius: 10px;
  margin-top: 20px;
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  &:hover {
    background-color: #1976d2;
  }
`;

function App() {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(Array(6).fill(0));
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const animationId = useRef(null);

  // 감정 결과 상태 관리
  const [emotionResults, setEmotionResults] = useState({
    angry: 0,
    disgust: 0,
    fear: 0,
    happy: 0,
    sad: 0,
    surprise: 0
  });

  useEffect(() => {
    tf.loadLayersModel(process.env.PUBLIC_URL + "/models/model.json").then(setModel);
    return () => {if (animationId.current) {cancelAnimationFrame(animationId.current);}}; 
  }, []);

  // 성공 여부 체크
  useEffect(() => {
    if (isStarted && selectedEmotion && emotionResults[selectedEmotion.toLowerCase()] >= 0.3) {
      setIsSuccess(true);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    }
  }, [emotionResults, selectedEmotion, isStarted]);

  // 이미지 전처리 함수
  const processImage = (img) => {
    return tf.tidy(() => {
      // 이미지를 [48, 48, 3]으로 리사이즈
        const resized = tf.browser.fromPixels(img)
        .resizeBilinear([48, 48])
        .toFloat()
        .div(255.0);
      
      // RGB 채널을 평균내어 흑백으로 변환 (채널 축인 2번 축을 기준으로 평균)
      const grayscale = resized.mean(2, true); // [48, 48, 1] 형태가 됨
      
      // 배치 차원 추가
      return grayscale.expandDims(0); // [1, 48, 48, 1]
    });
  };

  const predict = useCallback(() => {
    if (!model || !webcamRef.current) return;

    const video = webcamRef.current.video;
    if (!video || !video.readyState || video.readyState < 2 || 
      video.videoWidth === 0 || video.videoHeight === 0) {
      animationId.current = requestAnimationFrame(predict);
      return;
    }
    const tensor = processImage(video);
    // 반드시 model.predict로 호출!
    const output = model.predict(tensor);

    output.data().then((arr) => {
      setPredictions(Array.from(arr));
      // emotionResults 상태 업데이트 추가
      setEmotionResults({
        angry: arr[0],
        disgust: arr[1],
        fear: arr[2],
        happy: arr[3],
        sad: arr[4],
        surprise: arr[5]
      });
    });
    tf.dispose([tensor, output]);
    animationId.current = requestAnimationFrame(predict);
  }, [model]);

  // 시작시 예측 루프 실행
  useEffect(() => {
    if (isStarted && !isSuccess) {
      animationId.current = requestAnimationFrame(predict);
    }
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [isStarted, predict, isSuccess]);

  // 감정 선택 핸들러
  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
  };

  // 시작 버튼 핸들러
  const handleStart = () => {
    if (selectedEmotion) {
      setIsStarted(true);
    } else {
      alert('감정을 선택해주세요.');
    }
  };

  // 리셋 버튼 핸들러
  const handleReset = () => {
    setIsSuccess(false);
    setIsStarted(false);
    setSelectedEmotion(null);
    setPredictions(Array(6).fill(0));
    setEmotionResults({
      angry: 0,
      disgust: 0,
      fear: 0,
      happy: 0,
      sad: 0,
      surprise: 0
    });
    
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }
  };

  // 감정별 색상
  const emotionColors = {
    angry: '#ff5252',
    disgust: '#9c27b0',
    fear: '#607d8b',
    happy: '#4caf50',
    sad: '#2196f3',
    surprise: '#ff9800'
  };

  return (
    <Container>
      {isSuccess && (
        <SuccessModal>
          <ModalContent>
            <h2>성공!</h2>
            <p>선택한 감정({emotionLabels[selectedEmotion.toLowerCase()]})을 잘 표현했습니다!</p>
            <Button onClick={handleReset}>다시 시작하기</Button>
          </ModalContent>
        </SuccessModal>
      )}

      {!isStarted ? (
        <LeftPanel>
          <Title>서청센 페스티벌 - AI를 이겨라! 세번째 게임</Title>
          <h2>감정 표현 게임</h2>
          <h3>표현할 감정을 선택해주세요.</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            {EMOTIONS.map((emotion) => (
              <TargetEmotion 
                key={emotion}
                selected={selectedEmotion === emotion}
                onClick={() => handleEmotionSelect(emotion)}
              >
                <h3>{emotionLabels[emotion.toLowerCase()]}</h3>
                <EmotionImage src={emotionImages[emotion.toLowerCase()]} alt={emotionLabels[emotion.toLowerCase()]} />
              </TargetEmotion>
            ))}
          </div>
          
          <Button onClick={handleStart}>시작하기</Button>
        </LeftPanel>
      ) : (
        <>
          <LeftPanel>
            <Title>감정 표현 게임</Title>
            <WebcamContainer>
              <StyledWebcam
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
              />
            </WebcamContainer>
          </LeftPanel>
          
          <RightPanel>
            {EMOTIONS.map((emotion, index) => (
              <div key={emotion} style={{ width: '100%', marginBottom: '10px' }}>
                <EmotionLabel>
                  <span>{emotionLabels[emotion.toLowerCase()]}</span>
                  <EmotionValue>{(predictions[index] * 100).toFixed(1)}%</EmotionValue>
                </EmotionLabel>
                <EmotionBar>
                  <EmotionFill value={predictions[index]} color={emotionColors[emotion.toLowerCase()]} />
                </EmotionBar>
              </div>
            ))}
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h3>목표 감정</h3>
              <h2>{emotionLabels[selectedEmotion.toLowerCase()]}</h2>
              <EmotionImage src={emotionImages[selectedEmotion.toLowerCase()]} alt={emotionLabels[selectedEmotion.toLowerCase()]} />
              
              <div style={{ marginTop: '20px' }}>
                <h3>목표 달성률</h3>
                <h2>{(emotionResults[selectedEmotion.toLowerCase()] * 100).toFixed(1)}%</h2>
                <p>{emotionResults[selectedEmotion.toLowerCase()] >= 0.3 ? '✅ 목표 달성!' : '⏳ 진행 중...'}</p>
              </div>
            </div>
            
            <Button onClick={handleReset}>다시 시작하기</Button>
          </RightPanel>
        </>
      )}
    </Container>
  );
}

export default App;
