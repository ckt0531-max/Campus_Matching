## 캠퍼스 팀플 매칭 서비스
**팀원을 구하지 못한 성결대 공대 학생들을 위한 서비스**

팀프로젝트를 수행하기 위해 팀원을 구하는 학생들이
원하는 역할의 학생들과 매칭되기 쉽도록 하는 웹 서비스입니다.

## 주요 기능
- **사용자 프로필** (선호 역할, 협업 스타일 입력)
- **조건 기반 팀원 매칭** (수업 및 프로필 검색, 팀원 모집 게시글 업로드)
- **조원 평가** (기여도 기반 상호 평가 시스템)
- **수업 별 조원 관리 기능**

## 기술 스택
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **DB**: MySQL

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
