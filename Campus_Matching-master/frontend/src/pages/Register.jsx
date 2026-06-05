import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const navigate = useNavigate();

  const handleRegister = (e) => {
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

    // 4. 아이디 검증
    if (!username.trim()) {
      alert("아이디를 입력해주세요.");
      setErrorMsg("아이디를 입력해주세요.");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9]{4,12}$/;
    if (!usernameRegex.test(username.trim())) {
      alert("아이디는 4~12자의 영문 대소문자 및 숫자만 가능합니다.");
      setErrorMsg("아이디는 4~12자의 영문 대소문자 및 숫자만 가능합니다.");
      return;
    }

    // 5. 비밀번호 검증
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

    // 6. 비밀번호 확인 일치성 검증
    if (password !== confirmPassword) {
      alert("비밀번호 확인이 비밀번호와 일치하지 않습니다.");
      setErrorMsg("비밀번호 확인이 비밀번호와 일치하지 않습니다.");
      return;
    }

    // 백엔드 연동 없이 시연을 위해 로컬스토리지 임시 유저 저장
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const userExists = users.some((u) => u.username === username);
    if (userExists) {
      alert("이미 존재하는 아이디입니다.");
      setErrorMsg("이미 존재하는 아이디입니다.");
      return;
    }

    const newUser = {
      username,
      password,
      name,
      studentId,
      department,
    };
    users.push(newUser);
    localStorage.setItem("mockUsers", JSON.stringify(users));

    setSuccessMsg("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");

    // 시연용 딜레이 후 이동
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
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
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Register;