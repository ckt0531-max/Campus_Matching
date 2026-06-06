import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./PostDetail.css"; // CSS 파일 분리 및 임포트

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(() => {
    const appliedList = JSON.parse(localStorage.getItem("appliedPosts") || "[]");
    return appliedList.map(String).includes(id.toString());
  });

  const [showMsg, setShowMsg] = useState(false);
  const [showAppliedMsg, setShowAppliedMsg] = useState(false); 
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

    fetchPost();
    fetchUnreadCount();
  }, [id, user]);

  useEffect(() => {
    if (showMsg) {
      const t = setTimeout(() => setShowMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showMsg]);

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

    if (post.isClosed || isApplied) {
      setShowAppliedMsg(true);
      return;
    }

    setIsApplying(true);

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

    if (!post.authorId) {
      alert("이 게시글은 신청을 받을 수 없습니다. (작성자 정보 없음)");
      setIsApplying(false);
      return;
    }

    try {
      await api.post("/notifications/apply", {
        senderId: currentUser.studentId,
        senderName: currentUser.name || currentUser.studentId,
        receiverId: post.authorId,
        teamTitle: post.title,
      });

      const appliedList = JSON.parse(localStorage.getItem("appliedPosts") || "[]");
      if (!appliedList.map(String).includes(id.toString())) {
        appliedList.push(id);
        localStorage.setItem("appliedPosts", JSON.stringify(appliedList));
      }

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
      <div className="detailContainer flex-center">
        <div className="statusMessageText">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="detailContainer flex-center">
        <div className="detailErrorAlert">게시글을 찾을 수 없습니다.</div>
        <Link to="/" className="detailBackHomeBtn">홈으로 이동</Link>
      </div>
    );
  }

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

      {/* 게시글 본문 섹션 */}
      <div className="detailContainer">
        <div className="detailBox">
          {showMsg && <div className="detailAlertBox successAlert">신청이 완료되었습니다.</div>}
          {showAppliedMsg && (
            <div className="detailAlertBox infoAlert">
              {post.isClosed ? "이미 신청 마감된 게시글입니다." : "이미 신청 완료된 게시글입니다."}
            </div>
          )}

          <h3 className="detailMainTitle">{post.title}</h3>

          <div className="metaRow">
            <span className="metaItem"><strong>작성자</strong> {post.author || "익명"}</span>
            <span className="metaDivider">|</span>
            <span className="metaItem"><strong>작성일</strong> {post.date}</span>
          </div>

          <div className="detailContentPanel">
            <div className="infoGrid">
              <div className="infoGridItem"><strong>모집 분야</strong> <span className="categoryBadge">{post.category}</span></div>
              <div className="infoGridItem"><strong>모집 인원</strong> {post.people}</div>
              <div className="infoGridItem"><strong>진행 장소</strong> {post.place}</div>
            </div>
            
            <hr className="detailDivider" />
            
            <div className="contentTextBody">
              <h4 className="bodyLabel">상세 내용</h4>
              <p className="bodyParagraph">{post.content}</p>
            </div>
          </div>

          {/* 하단 제어 버튼 분기 영역 */}
          {post.authorId === (user ? user.studentId : "") ? (
            <div className="authorControlWrapper">
              <div className="actionBtnGroup">
                <button
                  onClick={handleToggleClosePost}
                  className={`actionStateBtn ${post.isClosed ? "btnReopen" : "btnClose"}`}
                  disabled={isUpdatingStatus}
                >
                  {post.isClosed ? "모집 재개하기" : "모집 마감하기"}
                </button>
                <button onClick={handleDeletePost} className="actionDeleteBtn">
                  삭제하기
                </button>
              </div>
              <button className="disabledStatusBtn" disabled>
                내 게시글 {post.isClosed && "(마감됨)"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClickApply}
              className={`primaryApplySubmitBtn ${post.isClosed ? "statusClosed" : isApplied ? "statusApplied" : ""}`}
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