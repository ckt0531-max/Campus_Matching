import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function UserInfo() {
  // 현재 로그인한 사용자 정보 로드
  const getInitialValue = (field) => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsed = JSON.parse(loggedInUser);
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
      const matched = mockUsers.find((u) => u.username === parsed.username);
      if (matched) {
        return matched[field] || "";
      }
    }
    return "";
  };

  const [name, setName] = useState(() => getInitialValue("name"));
  const [studentId, setStudentId] = useState(() => getInitialValue("studentId"));
  const [age, setAge] = useState(() => getInitialValue("age"));
  const [department, setDepartment] = useState(() => getInitialValue("department"));
  const [role, setRole] = useState(() => getInitialValue("role") || "역할 선택");
  const [selfIntro, setSelfIntro] = useState(() => getInitialValue("selfIntro"));

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // 로그인 상태 가드: 로그인하지 않은 상태로 접근 시 로그인 화면으로 리다이렉트
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
    }
  }, [navigate]);

  // 현재 로그인한 사용자 프로필 상태 관리 (isProfileRegistered 플래그 기반)
  const [currentProfile, setCurrentProfile] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsed = JSON.parse(loggedInUser);
      const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
      const matched = mockUsers.find((u) => u.username === parsed.username);
      if (matched && matched.isProfileRegistered) {
        return matched;
      }
    }
    return null;
  });

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 학번 검증: 숫자 이외의 문자가 들어가면 에러 출력
    if (!studentId.trim()) {
      setErrorMsg("학번을 입력해주세요.");
      return;
    }
    
    // 숫자 체크 정규식
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(studentId)) {
      setErrorMsg("학번은 숫자만 입력할 수 있습니다.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("이름을 입력해주세요.");
      return;
    }

    // 나이 검증: 필수 및 숫자 체크
    if (!age.trim()) {
      setErrorMsg("나이를 입력해주세요.");
      return;
    }
    if (!numericRegex.test(age.trim())) {
      alert("나이는 숫자만 입력할 수 있습니다.");
      setErrorMsg("나이는 숫자만 입력할 수 있습니다.");
      return;
    }

    // 학과 검증: 필수 및 문자 체크 (숫자, 특수문자 불가)
    if (!department.trim()) {
      setErrorMsg("학과를 입력해주세요.");
      return;
    }
    const alphaKoreanRegex = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]+$/;
    if (!alphaKoreanRegex.test(department.trim())) {
      alert("학과에는 한글과 영문(글자)만 입력할 수 있습니다.");
      setErrorMsg("학과에는 글자만 입력할 수 있습니다.");
      return;
    }

    // 자기소개 검증: 10글자 이하 시 경고 팝업 출력 (진행은 계속됨)
    if (selfIntro.trim().length <= 10) {
      alert("자기소개가 너무 짧으면 다른 회원들이 회원님 정보 확인이 어려워서 불이익이 있을 수 있습니다.");
    }

    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      setErrorMsg("로그인 세션이 존재하지 않습니다.");
      return;
    }
    const parsed = JSON.parse(loggedInUser);

    // mockUsers 배열에서 현재 로그인한 유저 정보를 찾아 업데이트
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const userIndex = mockUsers.findIndex((u) => u.username === parsed.username);

    if (userIndex !== -1) {
      const updatedUser = {
        ...mockUsers[userIndex],
        name,
        studentId,
        age,
        department,
        role,
        selfIntro,
        isProfileRegistered: true, // 프로필 등록 완료 표시
      };
      mockUsers[userIndex] = updatedUser;
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
      setCurrentProfile(updatedUser); // 프로필 카드 실시간 업데이트
    }

    setSuccessMsg("사용자 정보가 성공적으로 등록/수정되었습니다!");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="container">
      <h2>회원 정보 관리</h2>

      {/* 내 정보 확인 카드 영역 */}
      <div className="profileViewSection">
        <h3>내 정보 확인</h3>
        {currentProfile ? (
          <div className="profileCard">
            <div className="profileCardHeader">
              <span className="profileBadge">등록 완료</span>
            </div>
            <div className="profileGrid">
              <p><strong>이름:</strong> {currentProfile.name}</p>
              <p><strong>학번:</strong> {currentProfile.studentId}</p>
              <p><strong>나이:</strong> {currentProfile.age || "미입력"}세</p>
              <p><strong>학과:</strong> {currentProfile.department}</p>
              <p><strong>역할:</strong> {currentProfile.role}</p>
            </div>
            <div className="profileIntro">
              <strong>자기소개:</strong>
              <p>{currentProfile.selfIntro || "등록된 자기소개가 없습니다."}</p>
            </div>
          </div>
        ) : (
          <div className="infoAlert">
            등록된 사용자 정보가 없습니다. 아래 양식에서 등록해주세요.
          </div>
        )}
      </div>

      {/* 정보 등록 및 수정 폼 영역 */}
      <div className="profileEditSection">
        <h3>{currentProfile ? "정보 수정하기" : "정보 등록하기"}</h3>
        <form onSubmit={handleSaveInfo} className="formBox">
          {errorMsg && <div className="errorAlert">{errorMsg}</div>}
          {successMsg && <div className="successAlert">{successMsg}</div>}

          <label className="inputLabel">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="inputLabel">학번 (숫자만 입력 가능)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="학번을 입력하세요 (예: 20231234)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <label className="inputLabel">나이</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="나이를 입력하세요"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <label className="inputLabel">학과</label>
          <input
            type="text"
            placeholder="학과를 입력하세요"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <label className="inputLabel">역할 선택</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="역할 선택">역할 선택</option>
            <option value="보고서 및 PPT">보고서 및 PPT</option>
            <option value="발표">발표</option>
            <option value="코딩">코딩</option>
            <option value="팀장">팀장</option>
          </select>

          <label className="inputLabel">자기소개</label>
          <textarea
            placeholder="자기소개를 입력하세요"
            value={selfIntro}
            onChange={(e) => setSelfIntro(e.target.value)}
          ></textarea>

          <button type="submit">저장 완료</button>
        </form>
      </div>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default UserInfo;