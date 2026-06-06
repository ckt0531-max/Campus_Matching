import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function UserInfo() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("역할 선택");
  const [selfIntro, setSelfIntro] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const [currentProfile, setCurrentProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

  const roleToBackend = (r) => {
    switch (r) {
      case "보고서 및 PPT": return "ppt";
      case "발표": return "presentation";
      case "코딩": return "research";
      case "팀장": return "leader";
      default: return "all-rounder";
    }
  };

  const roleToFrontend = (r) => {
    switch (r) {
      case "ppt": return "보고서 및 PPT";
      case "presentation": return "발표";
      case "research": return "코딩";
      case "leader": return "팀장";
      default: return "역할 선택";
    }
  };

  // 로그인 상태 가드 및 프로필 정보 로드
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await api.get("/auth/me");
        setCurrentProfile(user);
        setName(user.name || "");
        setStudentId(user.studentId || "");
        setDepartment(user.department || "");
        setRole(roleToFrontend(user.preferredRole));
        setSelfIntro(user.introduction || "");

        // 알림 개수 계산
        const notiRes = await api.get(`/notifications/${user.studentId}`);
        if (notiRes && notiRes.success && Array.isArray(notiRes.data)) {
          const count = notiRes.data.filter((n) => !n.isRead).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("프로필 정보를 불러오는데 실패했습니다.");
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentProfile(null);
      alert("로그아웃 되었습니다.");
      navigate("/");
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("이름을 입력해주세요.");
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

    try {
      const res = await api.patch("/auth/profile", {
        name: name.trim(),
        department: department.trim(),
        preferredRole: roleToBackend(role),
        introduction: selfIntro.trim(),
      });

      // 로컬스토리지 user 객체 업데이트
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const parsed = JSON.parse(loggedInUser);
        localStorage.setItem("user", JSON.stringify({
          ...parsed,
          name: res.user.name,
          department: res.user.department,
          introduction: res.user.introduction,
        }));
      }

      setCurrentProfile(res.user);
      setSuccessMsg("사용자 정보가 성공적으로 수정되었습니다!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      alert(err.message || "프로필 수정에 실패했습니다.");
      setErrorMsg(err.message || "프로필 수정에 실패했습니다.");
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

        {currentProfile ? (
          <>
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <Link to="/write" className="writeHeaderButton">게시글 작성</Link>
            <Link to="/notification" className="alarmBellButton" style={{ position: "relative" }} title="알림">
              🔔
              {unreadCount > 0 && (
                <span className="unreadBadge" style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.4)"
                }}>{unreadCount}</span>
              )}
            </Link>
            <Link to="/user-info" className="userInfoBtn">{currentProfile.name || currentProfile.studentId}님</Link>
            <button onClick={handleLogout} className="logoutBtn">로그아웃</button>
          </>
        ) : (
          <div className="userNav">
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <span onClick={handleRequireLogin} className="writeHeaderButton" style={{ cursor: "pointer" }}>게시글 작성</span>
            <span onClick={handleRequireLogin} className="alarmBellButton" style={{ cursor: "pointer" }} title="알림">🔔</span>
            <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
            <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
          </div>
        )}
      </div>

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
                <p><strong>학과:</strong> {currentProfile.department}</p>
                <p><strong>역할:</strong> {roleToFrontend(currentProfile.preferredRole)}</p>
              </div>
              <div className="profileIntro">
                <strong>자기소개:</strong>
                <p>{currentProfile.introduction || "등록된 자기소개가 없습니다."}</p>
              </div>
            </div>
          ) : (
            <div className="infoAlert">
              로딩 중이거나 등록된 사용자 정보가 없습니다.
            </div>
          )}
        </div>

        {/* 정보 등록 및 수정 폼 영역 */}
        <div className="profileEditSection">
          <h3>정보 수정하기</h3>
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

            <label className="inputLabel">학번 (수정 불가)</label>
            <input
              type="text"
              value={studentId}
              disabled
              style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
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
      </div>
    </>
  );
}

export default UserInfo;