import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

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

    // 입력값 검증
    if (!title.trim()) {
      setErrorMsg("제목을 입력해주세요.");
      return;
    }
    if (!people.trim()) {
      setErrorMsg("모집 인원을 입력해주세요.");
      return;
    }
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(people.trim())) {
      setErrorMsg("모집 인원은 숫자만 입력 가능합니다.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("내용을 입력해주세요.");
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

        {user ? (
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
            <Link to="/user-info" className="userInfoBtn">{user.name || user.studentId}님</Link>
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
        <h2>게시글 작성</h2>

        <form onSubmit={handleWritePost} className="formBox">
          {errorMsg && <div className="errorAlert">{errorMsg}</div>}
          {successMsg && <div className="successAlert">{successMsg}</div>}

          <label className="inputLabel">게시글 제목</label>
          <input
            type="text"
            placeholder="게시글 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="inputLabel">과목 선택</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="과목 선택">과목 선택</option>
            <option value="인공지능">인공지능</option>
            <option value="모바일 프로그래밍">모바일 프로그래밍</option>
            <option value="소프트웨어 공학">소프트웨어 공학</option>
            <option value="웹응용기술">웹응용기술</option>
          </select>

          <label className="inputLabel">모집 인원 (숫자만 입력 가능)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="모집 인원을 숫자로 입력하세요 (예: 3)"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />

          <label className="inputLabel">장소</label>
          <input
            type="text"
            placeholder="장소를 입력하세요 (예: 학술정보관 1층)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />

          <label className="inputLabel">게시글 내용</label>
          <textarea
            placeholder="게시글 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "작성 중..." : "작성 완료"}
          </button>
        </form>
      </div>
    </>
  );
}

export default WritePost;