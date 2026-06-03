import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="container">
      <h2>로그인</h2>

      <div className="formBox">
        <input type="text" placeholder="아이디를 입력하세요" />
        <input type="password" placeholder="비밀번호를 입력하세요" />

        <button>로그인</button>
      </div>

      <p>
        계정이 없나요? <Link to="/register">회원가입</Link>
      </p>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Login;