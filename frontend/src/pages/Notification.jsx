import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const loadNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${user.studentId}`);
        if (res.success && Array.isArray(res.data)) {
          setNotifications(res.data);

          // 읽지 않은 알림 개수 임시 계산
          const unread = res.data.filter((n) => !n.isRead);
          setUnreadCount(unread.length);

          // 읽지 않은 알림들의 읽음 처리
          await Promise.all(
            unread.map((n) => api.patch(`/notifications/${n.id}/read`))
          );

          // 처리 후 읽지 않은 개수 초기화
          setUnreadCount(0);
        }
      } catch (err) {
        console.error("알림 조회 에러:", err);
      }
    };

    loadNotifications();
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

  const handleDeleteNotification = async (notiId) => {
    if (!window.confirm("이 알림을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/notifications/${notiId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notiId));
    } catch (err) {
      console.error(err);
      alert("알림 삭제에 실패했습니다.");
    }
  };

  const unreadNotis = notifications.filter(n => !n.isRead);
  const readNotis = notifications.filter(n => n.isRead);

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
        <h2>알림창</h2>

        {notifications.length > 0 ? (
          <>
            {unreadNotis.length > 0 && (
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ color: "#ef4444", borderBottom: "2px solid #fee2e2", paddingBottom: "8px" }}>새로운 알림</h3>
                {unreadNotis.map((noti) => (
                  <div className="noticeBox" key={noti.id} style={{ borderLeft: "4px solid #ef4444" }}>
                    <div className="noticeHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, color: "#ef4444" }}>
                        {noti.type === "apply" ? "신청 완료 알림" : "알림"}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="noticeTime" style={{ fontSize: "12px", color: "#64748b" }}>
                          {new Date(noti.createdAt).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleDeleteNotification(noti.id)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "12px", padding: 0, cursor: "pointer", boxShadow: "none" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0 }}>{noti.message}</p>
                  </div>
                ))}
              </div>
            )}

            {readNotis.length > 0 && (
              <div>
                <h3 style={{ color: "#64748b", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>기존 알림</h3>
                {readNotis.map((noti) => (
                  <div className="noticeBox" key={noti.id} style={{ backgroundColor: "#f8fafc", opacity: 0.8 }}>
                    <div className="noticeHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, color: "#64748b" }}>
                        {noti.type === "apply" ? "신청 완료 알림" : "알림"}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="noticeTime" style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {new Date(noti.createdAt).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleDeleteNotification(noti.id)}
                          style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "12px", padding: 0, cursor: "pointer", boxShadow: "none" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: "#64748b" }}>{noti.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="emptyState" style={{ textAlign: "center", padding: "40px 0" }}>
            <p className="emptyStateIcon" style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🔔</p>
            <p className="emptyStateText" style={{ color: "#64748b" }}>새로운 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Notification;