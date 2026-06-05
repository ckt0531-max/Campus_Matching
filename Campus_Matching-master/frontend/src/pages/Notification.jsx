import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(loggedInUser);
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // 현재 로그인한 사용자의 알림만 필터링
    const myNotis = allNotifications.filter((n) => n.username === parsed.username);
    setNotifications(myNotis);

    // 전체 알림 리스트에서 내 알림들의 isRead를 true로 업데이트 후 저장
    const updatedNotifications = allNotifications.map((n) => {
      if (n.username === parsed.username) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  }, [navigate]);

  return (
    <div className="container">
      <h2>알림창</h2>

      {notifications.length > 0 ? (
        notifications.map((noti) => (
          <div className="noticeBox" key={noti.id}>
            <div className="noticeHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ margin: 0 }}>{noti.title}</h3>
              <span className="noticeTime" style={{ fontSize: "12px", color: "#64748b" }}>{noti.time}</span>
            </div>
            <p style={{ margin: 0 }}>{noti.message}</p>
          </div>
        ))
      ) : (
        <div className="emptyState" style={{ textAlign: "center", padding: "40px 0" }}>
          <p className="emptyStateIcon" style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🔔</p>
          <p className="emptyStateText" style={{ color: "#64748b" }}>새로운 알림이 없습니다.</p>
        </div>
      )}

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Notification;