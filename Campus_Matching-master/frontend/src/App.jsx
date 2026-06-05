import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserInfo from "./pages/UserInfo";
import WritePost from "./pages/WritePost";
import PostDetail from "./pages/PostDetail";
import Notification from "./pages/Notification";

function App() {
  // 백엔드 수정 없이 시연용 처리를 위한 초기 게시글 설정
  useEffect(() => {
    if (!localStorage.getItem("posts")) {
      const defaultPosts = [
        {
          id: 1,
          title: "인공지능 팀플 팀원 모집",
          category: "인공지능",
          people: "4명",
          place: "성결관 401호",
          content: "함께 인공지능 팀플을 진행할 팀원을 모집합니다. AI 기초 지식이 있는 분 대환영합니다!",
          author: "김철수",
          date: "2026-06-05",
        },
        {
          id: 2,
          title: "웹 프로젝트 팀원 모집",
          category: "웹응용기술",
          people: "3명",
          place: "학술정보관",
          content: "React를 활용한 웹 프로젝트를 같이 할 팀원을 구합니다. 프론트/백엔드 가리지 않고 환영합니다.",
          author: "이영희",
          date: "2026-06-04",
        },
        {
          id: 3,
          title: "C언어 과제 스터디 모집",
          category: "모바일 프로그래밍",
          people: "5명",
          place: "온라인",
          content: "C언어 과제를 같이 공부할 스터디원을 모집합니다. 매주 스터디 진행합니다.",
          author: "박민수",
          date: "2026-06-03",
        },
      ];
      localStorage.setItem("posts", JSON.stringify(defaultPosts));
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-info" element={<UserInfo />} />
        <Route path="/write" element={<WritePost />} />
        {/* React Router /posts/:id 형태로 경로 수정 */}
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/notification" element={<Notification />} />
      </Routes>
    </div>
  );
}

export default App;