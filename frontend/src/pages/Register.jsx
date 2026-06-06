import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
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

    // 2. 학번 검증
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
        studentId: studentId.trim(),
        name: name.trim(),
        department: department.trim(),
        password,
      });

      setSuccessMsg("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");

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
          <Link to="/register" className="headerLink headerLinkOutline" style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>회원가입</Link>
          <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
        </div>
      </div>

      <div className="container">
        <h2>회원가입</h2>

        <form onSubmit={handleRegister} className="formBox">
          {errorMsg && <div className="errorAlert">{errorMsg}</div>}
          {successMsg && <div className="successAlert">{successMsg}</div>}

          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="학번"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input
            type="text"
            placeholder="학과"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">회원가입</button>
        </form>
      </div>
    </>
  );
}

export default Register;