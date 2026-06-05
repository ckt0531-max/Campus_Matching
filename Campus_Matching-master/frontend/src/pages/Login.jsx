import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 입력값 검증
    if (!username.trim() && !password.trim()) {
      setErrorMsg("아이디(학번)와 비밀번호를 입력해주세요.");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("아이디 또는 학번을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    // 프론트 임시 로그인 처리: mockUsers 검증
    const storedUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const matchedUser = storedUsers.find(u => u.username === username && u.password === password);
    if (!matchedUser) {
      alert("아이디와 비밀번호가 일치하지 않습니다.");
      setErrorMsg("아이디와 비밀번호가 일치하지 않습니다.");
      return;
    }
    localStorage.setItem(
      "user",
      JSON.stringify({ username: username, isLoggedIn: true })
    );
    // 로그인 성공 후 사용자 정보 화면으로 이동
    navigate("/user-info");
  };

  return (
    <div className="container">
      <h2>로그인</h2>

      <form onSubmit={handleLogin} className="formBox">
        {errorMsg && <div className="errorAlert">{errorMsg}</div>}

        <input
          type="text"
          placeholder="아이디 또는 학번을 입력하세요"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Login;