## 실행 방법
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

## 개별 실행
**백엔드 (Node.js)**
```bash
cd backend
npm install
npm start
```

**프론트엔드 (React + Vite)**
```bash
cd frontend
npm install
npm run dev
```
브라우저: http://localhost:5173

## 작업 순서

**① 작업 시작 전 항상 develop 최신화**
```bash
git pull origin master
```

**② 작업 후 커밋 & 푸시**
```bash
git add .
git commit -m "feat: 작업 내용 요약"
git push origin master
```

| 태그 | 용도 |
|------|------|
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
