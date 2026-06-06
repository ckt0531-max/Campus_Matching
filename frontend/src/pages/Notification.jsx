import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Notification.css"; // CSS 파일 분리 및 임포트

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

          // 읽지 않은 알림 개수 계산
          const unread = res.data.filter((n) => !n.isRead);
          setUnreadCount(unread.length);

          // 읽지 않은 알림들의 읽음 처리 API 호출
          await Promise.all(
            unread.map((n) => api.patch(`/notifications/${n.id}/read`))
          );

          // 로컬 상태 업데이트
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        <Link to="/" className="headerLogoLink">
          <span className="logoEmoji">🤝</span>
          <span className="logoTitle">팀 매칭 서비스</span>
        </Link>

        {user ? (
          <>
            <Link to="/all-posts" className="headerLink">전체 게시판</Link>
            <Link to="/write" className="writeHeaderButton">게시글 작성</Link>
            <Link to="/notification" className="alarmBellButton" title="알림">
              🔔
              {unreadCount > 0 && (
                <span className="unreadBadge">{unreadCount}</span>
              )}
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

      <div className="container">
        <h2 className="notificationMainTitle">알림창</h2>

        {notifications.length > 0 ? (
          <>
            {/* 새로운 알림 영역 */}
            {unreadNotis.length > 0 && (
              <div className="notificationSection">
                <h3 className="sectionTitle unreadSectionTitle">새로운 알림</h3>
                <div className="noticeListGroup">
                  {unreadNotis.map((noti) => (
                    <div className="noticeBox unreadNoticeBox" key={noti.id}>
                      <div className="noticeHeader">
                        <h4 className="noticeTypeTitle unreadTypeTitle">
                          {noti.type === "apply" ? "신청 완료 알림" : "알림"}
                        </h4>
                        <div className="noticeMetaGroup">
                          <span className="noticeTime">{new Date(noti.createdAt).toLocaleString()}</span>
                          <button 
                            onClick={() => handleDeleteNotification(noti.id)}
                            className="noticeDeleteBtn unreadDeleteBtn"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="noticeMessageText">{noti.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 기존 알림 영역 */}
            {readNotis.length > 0 && (
              <div className="notificationSection">
                <h3 className="sectionTitle readSectionTitle">기존 알림</h3>
                <div className="noticeListGroup">
                  {readNotis.map((noti) => (
                    <div className="noticeBox readNoticeBox" key={noti.id}>
                      <div className="noticeHeader">
                        <h4 className="noticeTypeTitle readTypeTitle">
                          {noti.type === "apply" ? "신청 완료 알림" : "알림"}
                        </h4>
                        <div className="noticeMetaGroup">
                          <span className="noticeTime readNoticeTime">{new Date(noti.createdAt).toLocaleString()}</span>
                          <button 
                            onClick={() => handleDeleteNotification(noti.id)}
                            className="noticeDeleteBtn readDeleteBtn"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <p className="noticeMessageText readMessageText">{noti.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 알림이 없을 때 */
          <div className="emptyState notificationEmptyState">
            <p className="emptyStateIcon">🔔</p>
            <p className="emptyStateText">새로운 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Notification;