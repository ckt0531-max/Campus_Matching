import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./WritePost.css"; // 외부 CSS 파일 바인딩

function WritePost() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("과목 선택");
  const [people, setPeople] = useState("");
  const [place, setPlace] = useState("");
  const [content, setContent] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

  // 로그인 상태 가드 및 알림 카운트 로딩
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const fetchUnreadCount = async () => {
      if (user && user.studentId) {
        try {
          const notiRes = await api.get(`/notifications/${user.studentId}`);
          if (notiRes && notiRes.success && Array.isArray(notiRes.data)) {
            const count = notiRes.data.filter((n) => !n.isRead).length;
            setUnreadCount(count);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchUnreadCount();
  }, [navigate, user]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      alert("로그아웃 되었습니다.");
      navigate("/");
    }
  };

  const handleWritePost = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // 1. 제목 검증
    if (!title.trim()) {
      const msg = "제목을 입력해주세요.";
      alert(msg);
      setErrorMsg(msg);
      setIsSubmitting(false);
      return;
    }
    
    // 2. 모집 인원 빈 값 검증
    if (!people.trim()) {
      const msg = "모집 인원을 입력해주세요.";
      alert(msg);
      setErrorMsg(msg);
      setIsSubmitting(false);
      return;
    }
    
    // 3. 모집 인원 숫자 정규식 검증
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(people.trim())) {
      const msg = "모집 인원은 숫자만 입력 가능합니다.";
      alert(msg);
      setErrorMsg(msg);
      setIsSubmitting(false);
      return;
    }
    
    // 4. 내용 검증
    if (!content.trim()) {
      const msg = "내용을 입력해주세요.";
      alert(msg);
      setErrorMsg(msg);
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/posts", {
        title: title.trim(),
        content: content.trim(),
        category: subject !== "과목 선택" ? subject : "기타",
        people: people.trim() + "명",
        place: place.trim() || "장소 미정",
      });

      setSuccessMsg("게시글 작성이 성공적으로 완료되었습니다!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      alert(err.message || "게시글 작성에 실패했습니다.");
      setErrorMsg(err.message || "게시글 작성에 실패했습니다.");
      setIsSubmitting(false);
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

        {user ? (
          <>
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <Link to="/write" className="writeHeaderButton activeWriteTab">게시글 작성</Link>
            <Link to="/notification" className="alarmBellButton" title="알림">
              🔔
              {unreadCount > 0 && <span className="unreadBadge">{unreadCount}</span>}
            </Link>
            <Link to="/user-info" className="userInfoBtn">{user.name || user.studentId}님</Link>
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

      {/* 메인 에디터 컨테이너 */}
      <div className="editorContainer">
        <h2 className="editorMainTitle">새 팀원 모집하기</h2>

        <form onSubmit={handleWritePost} className="editorFormCard">
          {errorMsg && <div className="editorAlertBox errorAlert">{errorMsg}</div>}
          {successMsg && <div className="editorAlertBox successAlert">{successMsg}</div>}

          <div className="editorFormGroup">
            <label className="editorInputLabel">게시글 제목</label>
            <input
              type="text"
              placeholder="프로젝트 주제나 스터디 방향성을 알릴 수 있는 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="editorInputField"
            />
          </div>

          <div className="editorFieldGrid">
            <div className="editorFormGroup">
              <label className="editorInputLabel">과목 선택</label>
              <div className="selectWrapper">
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="editorSelectField">
                  <option value="과목 선택">과목 선택</option>
                  <option value="인공지능">인공지능</option>
                  <option value="모바일 프로그래밍">모바일 프로그래밍</option>
                  <option value="소프트웨어 공학">소프트웨어 공학</option>
                  <option value="웹응용기술">웹응용기술</option>
                </select>
              </div>
            </div>

            <div className="editorFormGroup">
              <label className="editorInputLabel">모집 인원</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="숫자만 입력 (예: 3)"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="editorInputField"
              />
            </div>
          </div>

          <div className="editorFormGroup">
            <label className="editorInputLabel">선호 모임 장소</label>
            <input
              type="text"
              placeholder="예: 학술정보관 1층 스터디룸 / 비대면 Zoom"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="editorInputField"
            />
          </div>

          <div className="editorFormGroup">
            <label className="editorInputLabel">상세 내용</label>
            <textarea
              placeholder="진행하려는 프로젝트 목표, 선호하는 팀원의 기술 스택이나 역할, 주간 고정 회의 시간대 등을 상세하게 공유해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="editorTextAreaField"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="editorSubmitBtn">
            {isSubmitting ? "게시글 등록 중..." : "팀원 모집 시작하기"}
          </button>
        </form>
      </div>
    </>
  );
}

export default WritePost;