import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./UserInfo.css"; // CSS 파일 분리 및 임포트

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
      case "올라운더": return "all-rounder";
      case "프론트엔드": return "frontend";
      case "백엔드": return "backend";
      case "디자인": return "design";
      default: return "all-rounder";
    }
  };

  const roleToFrontend = (r) => {
    switch (r) {
      case "ppt": return "보고서 및 PPT";
      case "presentation": return "발표";
      case "research": return "코딩";
      case "leader": return "팀장";
      case "all-rounder": return "올라운더";
      case "frontend": return "프론트엔드";
      case "backend": return "백엔드";
      case "design": return "디자인";
      default: return "역할 선택";
    }
  };

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
        <Link to="/" className="headerLogoLink">
          <span className="logoEmoji">🤝</span>
          <span className="logoTitle">팀 매칭 서비스</span>
        </Link>

        {currentProfile ? (
          <>
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <Link to="/write" className="writeHeaderButton">게시글 작성</Link>
            <Link to="/notification" className="alarmBellButton" title="알림">
              🔔
              {unreadCount > 0 && <span className="unreadBadge">{unreadCount}</span>}
            </Link>
            <Link to="/user-info" className="userInfoBtn activeProfileTab">
              {currentProfile.name || currentProfile.studentId}님
            </Link>
            <button onClick={handleLogout} className="logoutBtn">로그아웃</button>
          </>
        ) : (
          <div className="userNav">
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <span onClick={handleRequireLogin} className="writeHeaderButton pointer-cursor">게시글 작성</span>
            <span onClick={handleRequireLogin} className="alarmBellButton pointer-cursor" title="알림">🔔</span>
            <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
            <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
          </div>
        )}
      </div>

      <div className="dashboardContainer">
        <h2 className="dashboardMainTitle">회원 정보 관리</h2>

        {/* 내 정보 확인 카드 영역 */}
        <div className="profileViewSection">
          <h3 className="sectionSubTitle">내 정보 확인</h3>
          {currentProfile ? (
            <div className="profileViewCard">
              <div className="profileCardHeader">
                <span className="profileStatusBadge">ID 인증 완료</span>
              </div>
              <div className="profileDetailGrid">
                <div className="gridInfoItem"><strong>이름</strong> <span>{currentProfile.name}</span></div>
                <div className="gridInfoItem"><strong>학번</strong> <span>{currentProfile.studentId}</span></div>
                <div className="gridInfoItem"><strong>학과</strong> <span>{currentProfile.department}</span></div>
                <div className="gridInfoItem"><strong>선호 역할</strong> <span className="roleBadge">{roleToFrontend(currentProfile.preferredRole)}</span></div>
              </div>
              <div className="profileIntroBox">
                <h4 className="introLabel">자기소개</h4>
                <p className="introParagraph">{currentProfile.introduction || "등록된 자기소개가 없습니다."}</p>
              </div>
            </div>
          ) : (
            <div className="profileFallbackAlert">
              로딩 중이거나 등록된 사용자 정보가 없습니다.
            </div>
          )}
        </div>

        {/* 정보 등록 및 수정 폼 영역 */}
        <div className="profileEditSection">
          <h3 className="sectionSubTitle">정보 수정하기</h3>
          <form onSubmit={handleSaveInfo} className="profileEditForm">
            {errorMsg && <div className="profileAlert errorAlert">{errorMsg}</div>}
            {successMsg && <div className="profileAlert successAlert">{successMsg}</div>}

            <div className="profileFormGroup">
              <label className="profileInputLabel">이름</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profileInputField"
              />
            </div>

            <div className="profileFormGroup">
              <label className="profileInputLabel">학번 (수정 불가)</label>
              <input
                type="text"
                value={studentId}
                disabled
                className="profileInputField fieldDisabled"
              />
            </div>

            <div className="profileFormGroup">
              <label className="profileInputLabel">학과</label>
              <input
                type="text"
                placeholder="학과를 입력하세요"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="profileInputField"
              />
            </div>

            <div className="profileFormGroup">
              <label className="profileInputLabel">역할 선택</label>
              <div className="selectCustomWrapper">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="profileSelectField">
                  <option value="역할 선택">역할 선택</option>
                  <option value="올라운더">올라운더</option>
                  <option value="프론트엔드">프론트엔드</option>
                  <option value="백엔드">백엔드</option>
                  <option value="디자인">디자인</option>
                  <option value="보고서 및 PPT">보고서 및 PPT</option>
                  <option value="발표">발표</option>
                  <option value="코딩">코딩</option>
                  <option value="팀장">팀장</option>
                </select>
              </div>
            </div>

            <div className="profileFormGroup">
              <label className="profileInputLabel">자기소개</label>
              <textarea
                placeholder="팀원들에게 보여질 자기소개를 10자 이상 성실하게 입력하세요."
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                className="profileTextAreaField"
              ></textarea>
            </div>

            <button type="submit" className="profileSubmitBtn">저장 완료</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default UserInfo;