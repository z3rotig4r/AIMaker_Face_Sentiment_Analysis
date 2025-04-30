# AIMaker_Face_Sentiment_Analysis_README
> React 기반 Realtime-Face-Sentiment-Analysis 프로그램 (w/ tensorflowjs)

## 프로젝트 실행방법
0. React 환경 구축

1. 깃허브 레포지토리 클론
    ```
    git clone https://github.com/z3rotig4r/AIMaker_Face_Sentiment_Analysis.git
    ```
2. 로컬 프로젝트 폴더로 이동
   ```
   cd AIMaker_Face_Sentiment_Analysis
   ```
3. package-json 내 모듈 업데이트
    ```
    npm install
    ```
4. React 앱 동작
    ```
    npm start
    ```
5. 로컬에 생성된 웹 페이지 접근
    `localhost:3000`

## 프로젝트 폴더 구조
📦AIMaker_Face_Sentiment_Analysis  
 ┣ 📂.git  
 ┣ 📂node_modules  
 ┣ 📂public   
 ┃ ┣ 📂models  
 ┃ ┃ ┣ 📜group1-shard1of2.bin  
 ┃ ┃ ┣ 📜group1-shard2of2.bin     
 ┃ ┃ ┗ 📜models.json  
 ┃ ┣ 📜favicon.ico  
 ┃ ┣ 📜index.html  
 ┃ ┣ 📜logo192.png  
 ┃ ┣ 📜logo512.png  
 ┃ ┣ 📜manifest.json  
 ┃ ┗ 📜robot.txt   
 ┣ 📂src  
 ┃ ┣ 📜App.css  
 ┃ ┣ 📜App.js  
 ┃ ┣ 📜index.css  
 ┃ ┣ 📜index.js  
 ┃ ┗ 📜reportWebVitals.js   
 ┣ 📜.gitignore  
 ┣ 📜Dockerfile  
 ┣ 📜README.md  
 ┣ 📜emotion_recognition_model.h5  
 ┣ 📜emotion_recognition_model.tflite  
 ┣ 📜package-lock.json  
 ┗ 📜package.json  
