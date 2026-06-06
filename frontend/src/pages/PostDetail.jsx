import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const [showMsg, setShowMsg] = useState(false);
  const [showAppliedMsg, setShowAppliedMsg] = useState(false); // "이미 신청 완료/마감" 메시지 표시 여부
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

  // 게시글 정보 및 알림 비동기 로드
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

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

    const fetchAppliedStatus = async () => {
      if (user && user.studentId) {
        try {
          const appliedRes = await api.get(`/notifications/applied/${user.studentId}`);
          if (appliedRes && appliedRes.success && Array.isArray(appliedRes.data)) {
            const hasApplied = appliedRes.data.some(n => String(n.postId) === String(id));
            setIsApplied(hasApplied);
          }
        } catch (err) {
          console.error("신청 여부 로딩 실패:", err);
        }
      } else {
        setIsApplied(false);
      }
    };

    fetchPost();
    fetchUnreadCount();
    fetchAppliedStatus();
  }, [id, user]);

  // showMsg (신청 완료) 3초 후 자동 숨김
  useEffect(() => {
    if (showMsg) {
      const t = setTimeout(() => setShowMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showMsg]);

  // showAppliedMsg 메시지 3초 후 자동 숨김
  useEffect(() => {
    if (showAppliedMsg) {
      const t = setTimeout(() => setShowAppliedMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showAppliedMsg]);

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

  const onClickApply = async () => {
    if (isApplying || !post) return;

    if (post.isClosed) {
      setShowAppliedMsg(true);
      return;
    }

    if (isApplied) {
      setShowAppliedMsg(true);
      return;
    }

    setIsApplying(true);

    // 로그인 유저 식별
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      alert("로그인이 필요한 서비스입니다.");
      setIsApplying(false);
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(loggedInUser);

    if (!currentUser.introduction) {
      alert("회원 정보(자기소개 등)가 입력되지 않아 신청할 수 없습니다. 우측 상단 내 정보에서 정보를 먼저 등록해주세요.");
      setIsApplying(false);
      return;
    }

    if (post.authorId === currentUser.studentId) {
      alert("본인이 작성한 게시글에는 신청할 수 없습니다.");
      setIsApplying(false);
      return;
    }

    // authorId 없는 게시글 (예시 데이터 등) 처리
    if (!post.authorId) {
      alert("이 게시글은 신청을 받을 수 없습니다. (작성자 정보 없음)");
      setIsApplying(false);
      return;
    }

    try {
      // 백엔드 알림 신청 API 호출
      await api.post("/notifications/apply", {
        senderId: currentUser.studentId,
        senderName: currentUser.name || currentUser.studentId,
        receiverId: post.authorId, // 작성자의 학번
        teamTitle: post.title,
        postId: id,
      });

      setIsApplied(true);
      setShowMsg(true);
    } catch (err) {
      alert(err.message || "신청 과정에 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.delete(`/posts/${id}`);
      alert("게시글이 성공적으로 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      alert(err.message || "게시글 삭제에 실패했습니다.");
    }
  };

  const handleToggleClosePost = async () => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updatedPost = await api.patch(`/posts/${id}`, {
        isClosed: !post.isClosed
      });
      setPost(updatedPost);
      alert(updatedPost.isClosed ? "모집이 마감되었습니다." : "모집이 재개되었습니다.");
    } catch (err) {
      alert(err.message || "상태 변경에 실패했습니다.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div>데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="errorAlert">게시글을 찾을 수 없습니다.</div>
        <Link to="/" className="backButton">
          홈으로
        </Link>
      </div>
    );
  }

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
        <h2>게시글 세부화면</h2>

        <div className="detailBox">
          {showMsg && <div className="successAlert alertFadeOut">신청이 완료되었습니다.</div>}
          {showAppliedMsg && (
            <div className="infoAlert alertFadeOut">
              {post.isClosed ? "이미 신청 마감된 게시글입니다." : "이미 신청 완료된 게시글입니다."}
            </div>
          )}

          <h3>{post.title}</h3>

          <div className="metaRow">
            <span><strong>작성자:</strong> {post.author || "익명"}</span>
            <span><strong>작성일:</strong> {post.date}</span>
          </div>

          <div className="detailContent">
            <p><strong>모집 분야:</strong> {post.category}</p>
            <p><strong>모집 인원:</strong> {post.people}</p>
            <p><strong>장소:</strong> {post.place}</p>
            
            <hr className="divider" />
            
            <div className="contentText">
              <strong>내용:</strong>
              <p>{post.content}</p>
            </div>
          </div>

          {/* 신청 버튼 상태 분기 처리 */}
          {post.authorId === (user ? user.studentId : "") ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '25px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleToggleClosePost}
                  className="closeButton"
                  disabled={isUpdatingStatus}
                  style={{
                    backgroundColor: post.isClosed ? "#10b981" : "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: isUpdatingStatus ? "not-allowed" : "pointer",
                    flex: 1,
                    padding: "14px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    opacity: isUpdatingStatus ? 0.7 : 1
                  }}
                >
                  {post.isClosed ? "모집 재개하기" : "모집 마감하기"}
                </button>
                <button
                  onClick={handleDeletePost}
                  className="deleteButton"
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                    border: "1px solid #fca5a5",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    flex: 1,
                    padding: "14px"
                  }}
                >
                  삭제하기
                </button>
              </div>
              <button
                className="applyButton"
                disabled
                style={{ backgroundColor: "#cbd5e1", color: "#64748b", cursor: "not-allowed", marginTop: 0 }}
              >
                내 게시글 {post.isClosed && "(마감됨)"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClickApply}
              className={`applyButton ${post.isClosed ? "closed" : isApplied ? "applied" : ""}`}
              disabled={isApplying}
            >
              {post.isClosed ? "신청 마감" : isApplied ? "신청 완료" : isApplying ? "신청 중..." : "신청하기"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default PostDetail;