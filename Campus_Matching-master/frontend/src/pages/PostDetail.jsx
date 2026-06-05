import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function PostDetail() {
  const { id } = useParams();

  // 렌더링 시점에 localStorage에서 게시글 정보와 신청 여부를 동기적으로 계산하여 상태 복잡성 축소
  const post = (() => {
    const storedPosts = localStorage.getItem("posts");
    const postsList = storedPosts ? JSON.parse(storedPosts) : [];
    return postsList.find((item) => item.id.toString() === id.toString()) || null;
  })();

  const [isApplied, setIsApplied] = useState(() => {
    const appliedList = JSON.parse(localStorage.getItem("appliedPosts") || "[]");
    return appliedList.includes(id);
  });

  const [showMsg, setShowMsg] = useState(false);

  const onClickApply = () => {
    if (isApplied) return;

    // 백엔드 연동 없이 시연용 신청 상태 처리
    const appliedList = JSON.parse(localStorage.getItem("appliedPosts") || "[]");
    if (!appliedList.includes(id)) {
      appliedList.push(id);
      localStorage.setItem("appliedPosts", JSON.stringify(appliedList));
    }

    // 알림 시간 정보 생성
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 로그인 유저 식별
    const loggedInUser = localStorage.getItem("user");
    const username = loggedInUser ? JSON.parse(loggedInUser).username : "guest";

    // 새 알림 객체 생성
    const newNotification = {
      id: Date.now(),
      username,
      title: "신청 완료 알림",
      message: `"${post.title}" 게시글 신청이 정상적으로 완료되었습니다.`,
      time: timeString,
      isRead: false // 읽지 않음 표시 추가
    };

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.unshift(newNotification);
    localStorage.setItem("notifications", JSON.stringify(notifications));

    setIsApplied(true);
    setShowMsg(true);
  };

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
    <div className="container">
      <h2>게시글 세부화면</h2>

      <div className="detailBox">
        {showMsg && <div className="successAlert">신청이 완료되었습니다.</div>}
        {isApplied && !showMsg && <div className="infoAlert">이미 신청 완료된 게시글입니다.</div>}

        <h3>{post.title}</h3>

        <div className="metaRow">
          <span><strong>작성자:</strong> {post.author || "임시 사용자"}</span>
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
        <button
          onClick={onClickApply}
          className={`applyButton ${isApplied ? "applied" : ""}`}
          disabled={isApplied}
        >
          {isApplied ? "신청 완료" : "신청하기"}
        </button>
      </div>

      <Link to="/" className="backButton">
        홈으로
      </Link>
    </div>
  );
}

export default PostDetail;