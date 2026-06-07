import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Login.css"; // CSS 분리 및 임포트

function Login() {
  const [username, setUsername] = useState("");
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

    if (!username.trim() && !password.trim()) {
      setErrorMsg("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("아이디를 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const data = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

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
        <Link to="/" className="headerLogoLink">
          <span className="logoEmoji">🤝</span>
          <span className="logoTitle">팀 매칭 서비스</span>
        </Link>

        <div className="userNav">
          <Link to="/all-posts" className="headerLink">전체 게시판</Link>
          <span onClick={handleRequireLogin} className="writeHeaderButton pointer-cursor">게시글 작성</span>
          <span onClick={handleRequireLogin} className="alarmBellButton pointer-cursor" title="알림">🔔</span>
          <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
          <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
        </div>
      </div>

      {/* 로그인 폼 컨테이너 */}
      <div className="loginContainer">
        <h2 className="loginTitleHeading">로그인</h2>

        <form onSubmit={handleLogin} className="loginFormBox">
          {errorMsg && <div className="loginErrorAlert">{errorMsg}</div>}

          <div className="inputGroup">
            <label className="inputLabel">아이디</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="loginInput"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="loginInput"
            />
          </div>

          <button type="submit" className="loginSubmitBtn">로그인</button>
        </form>

        <p className="loginFooter">
          계정이 없나요? <Link to="/register" className="signupLink">회원가입</Link>
        </p>
      </div>
    </>
  );
}

export default Login;