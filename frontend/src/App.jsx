import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { api } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserInfo from "./pages/UserInfo";
import WritePost from "./pages/WritePost";
import PostDetail from "./pages/PostDetail";
import Notification from "./pages/Notification";
import AllPosts from "./pages/AllPosts";

function App() {
  // 앱 실행 시 기존 로그인 토큰이 유효한지 검증 (세션 자동 정리)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me")
        .then((userData) => {
          // 최신 사용자 정보로 동기화
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          // 유효하지 않은 세션일 경우 클리어 후 새로고침
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        });
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-posts" element={<AllPosts />} />
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