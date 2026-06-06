import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 입력값 검증
    if (!studentId.trim() && !password.trim()) {
      setErrorMsg("학번과 비밀번호를 입력해주세요.");
      return;
    }
    if (!studentId.trim()) {
      setErrorMsg("학번을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const data = await api.post("/auth/login", {
        studentId: studentId.trim(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 로그인 성공 후 첫 로그인 여부(자기소개 유무) 확인
      if (!data.user.introduction) {
        alert("처음 로그인하셨습니다. 원활한 팀 매칭을 위해 회원 정보를 마저 입력해주세요!");
        navigate("/user-info");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.message || "로그인에 실패했습니다.");
      setErrorMsg(err.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <>
      {/* 상단 통합 네비게이션 헤더 */}
      <div className="globalHeaderLinks">
        <Link to="/" className="headerLogoLink" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: 'auto',
          padding: '8px 16px',
          borderRadius: '14px',
          background: 'white',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <span className="logoEmoji" style={{ fontSize: '22px', margin: 0 }}>🤝</span>
          <span className="logoTitle" style={{ fontWeight: 800, fontSize: '16px' }}>팀 매칭 서비스</span>
        </Link>

        <div className="userNav">
          <Link to="/all-posts" className="headerLink">전체 게시판</Link>
          <span onClick={handleRequireLogin} className="writeHeaderButton" style={{ cursor: "pointer" }}>게시글 작성</span>
          <span onClick={handleRequireLogin} className="alarmBellButton" style={{ cursor: "pointer" }} title="알림">🔔</span>
          <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
          <Link to="/login" className="headerLink headerLinkFilled" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)" }}>로그인</Link>
        </div>
      </div>

      <div className="container">
        <h2>로그인</h2>

        <form onSubmit={handleLogin} className="formBox">
          {errorMsg && <div className="errorAlert">{errorMsg}</div>}

          <input
            type="text"
            placeholder="학번을 입력하세요"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">로그인</button>
        </form>

        <p>
          계정이 없나요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </>
  );
}

export default Login;