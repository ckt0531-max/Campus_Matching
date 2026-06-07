import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Register.css"; // CSS 파일 분리 및 임포트

function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const navigate = useNavigate();

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. 이름 검증
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      setErrorMsg("이름을 입력해주세요.");
      return;
    }
    const nameRegex = /^[a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      alert("이름은 한글 또는 영문으로만 입력 가능합니다.");
      setErrorMsg("이름은 한글 또는 영문으로만 입력 가능합니다.");
      return;
    }

    // 2. 아이디(username) 검증 (영문+숫자 허용)
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      setErrorMsg("아이디를 입력해주세요.");
      return;
    }
    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(username.trim())) {
      alert("아이디는 영문과 숫자만 입력 가능합니다.");
      setErrorMsg("아이디는 영문과 숫자만 입력 가능합니다.");
      return;
    }

    // 3. 학번 검증
    if (!studentId.trim()) {
      alert("학번을 입력해주세요.");
      setErrorMsg("학번을 입력해주세요.");
      return;
    }
    const studentIdRegex = /^[0-9]+$/;
    if (!studentIdRegex.test(studentId.trim())) {
      alert("학번은 숫자만 입력해주세요.");
      setErrorMsg("학번은 숫자만 입력해주세요.");
      return;
    }

    // 3. 학과 검증
    if (!department.trim()) {
      alert("학과를 입력해주세요.");
      setErrorMsg("학과를 입력해주세요.");
      return;
    }
    if (!nameRegex.test(department.trim())) {
      alert("학과에는 한글과 영문(글자)만 입력해주세요.");
      setErrorMsg("학과에는 글자만 입력해주세요.");
      return;
    }

    // 4. 비밀번호 검증
    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    // 5. 비밀번호 확인 일치성 검증
    if (password !== confirmPassword) {
      alert("비밀번호 확인이 비밀번호와 일치하지 않습니다.");
      setErrorMsg("비밀번호 확인이 비밀번호와 일치하지 않습니다.");
      return;
    }

    try {
      await api.post("/auth/signup", {
        username: username.trim(),
        studentId: studentId.trim(),
        name: name.trim(),
        department: department.trim(),
        password,
      });

      const successText = '회원가입이 완료되었습니다. 로그인 창으로 넘어갑니다.';
      setSuccessMsg("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      alert(successText);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      alert(err.message || "회원가입 중 오류가 발생했습니다.");
      setErrorMsg(err.message || "회원가입 중 오류가 발생했습니다.");
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
          <Link to="/register" className="headerLink headerLinkOutline currentTab">회원가입</Link>
          <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
        </div>
      </div>

      {/* 회원가입 메인 컨테이너 */}
      <div className="authContainer">
        <h2 className="authMainTitle">회원가입</h2>

        <form onSubmit={handleRegister} className="registerFormCard">
          {errorMsg && <div className="authAlertBox errorAlert">{errorMsg}</div>}
          {successMsg && <div className="authAlertBox successAlert">{successMsg}</div>}

          <div className="inputGroup">
            <label className="inputLabel">이름</label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="authInputField"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">아이디</label>
            <input
              type="text"
              placeholder="아이디를 입력하세요 (영문+숫자)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="authInputField"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">학번</label>
            <input
              type="text"
              placeholder="학번 8자리 입력 (숫자만)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="authInputField"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">학과</label>
            <input
              type="text"
              placeholder="컴퓨터공학과"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="authInputField"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">비밀번호</label>
            <input
              type="password"
              placeholder="6자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="authInputField"
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="authInputField"
            />
          </div>

          <button type="submit" className="authSubmitBtn">가입하기</button>

          <p className="authRedirectText">
            이미 계정이 있으신가요? <Link to="/login" className="authInlineLink">로그인하기</Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Register;