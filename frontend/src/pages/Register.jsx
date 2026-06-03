import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="container">
      <h2>회원가입</h2>

      <div className="formBox">
        <input type="text" placeholder="아이디" />
        <input type="password" placeholder="비밀번호" />
        <input type="password" placeholder="비밀번호 확인" />
        <input type="text" placeholder="이름" />

        <button>회원가입</button>
      </div>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Register;