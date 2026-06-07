import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Home.css"; // CSS 파일 임포트

function Home() {
  const [posts, setPosts] = useState([]);
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

  // 실시간 검색 필터링용 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 게시글 리스트 및 알림 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user && user.studentId) {
          const postsList = await api.get(`/posts?currentUserId=${encodeURIComponent(user.studentId)}`);
          setPosts(postsList);

          const notiRes = await api.get(`/notifications/${user.studentId}`);
          if (notiRes && notiRes.success && Array.isArray(notiRes.data)) {
            const count = notiRes.data.filter((n) => !n.isRead).length;
            setUnreadCount(count);
          }
        } else {
          const postsList = await api.get("/posts");
          setPosts(postsList);
        }
      } catch (err) {
        console.error("Home 데이터 로딩 에러:", err);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      alert("로그아웃 되었습니다.");
    }
  };

  // 검색어 기반 게시글 필터링 (제목, 내용, 카테고리 통합 검색)
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (post.title && post.title.toLowerCase().includes(query)) ||
      (post.content && post.content.toLowerCase().includes(query)) ||
      (post.category && post.category.toLowerCase().includes(query)) ||
      (post.author && post.author.toLowerCase().includes(query))
    );
  });

  const getDisplayName = () => {
    if (!user) return "";
    return user.name || user.studentId;
  };

  // (신청 이력은 서버로 관리되므로 로컬 저장소 기반 표시는 더 이상 사용되지 않음)

  return (
    <>
      <div className="globalHeaderLinks">
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
            <Link to="/user-info" className="userInfoBtn">{getDisplayName()}님</Link>
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
        {/* 가운데 정렬 로고 및 텍스트 */}
        <div className="homeHero">
          <span className="heroEmoji">🤝</span>
          <h1 className="heroTitle">팀 매칭 서비스</h1>
        </div>

        {/* 가운데 검색창 */}
        <div className="searchBarContainer">
          <div className="searchInputWrapper">
            <span className="searchIcon">🔍</span>
            <input
              type="text"
              className="searchInput"
              placeholder="게시글 제목, 내용, 과목, 작성자로 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="searchClearBtn"
                onClick={() => setSearchQuery("")}
                title="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 게시글 목록 헤더 */}
        <div className="postListHeader">
          <h3>게시글 목록</h3>
          {searchQuery && (
            <span className="searchResultCount">
              &quot;{searchQuery}&quot; 검색 결과: {filteredPosts.length}건
            </span>
          )}
        </div>

        {/* 게시글 카드 목록 */}
        <div className="postList">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link to={`/posts/${post.id}`} className="postCard" key={post.id}>
                <div className="postCardTop">
                  {post.category ? (
                    <span className="postCategoryBadge">{post.category}</span>
                  ) : (
                    <span></span> 
                  )}
                  
                  {user && post.authorId === user.studentId ? (
                    <span className="cardBadge badgeMyPost">내 게시물</span>
                  ) : post.isClosed ? (
                    <span className="cardBadge badgeClosed">신청 마감</span>
                  ) : post.isAppliedByCurrentUser ? (
                    <span className="cardBadge badgeApplied">신청 완료</span>
                  ) : (
                    <span className="cardBadge badgeAvailable">신청 가능</span>
                  )}
                </div>
                <h4>{post.title}</h4>
                <p className="postContentSnippet">
                  {post.content && post.content.length > 60
                    ? post.content.slice(0, 60) + "..."
                    : post.content}
                </p>
                <div className="postCardMeta">
                  <span className="postAuthor">작성자: {post.author || "임시 사용자"}</span>
                  <span className="postDate">작성일: {post.date}</span>
                </div>
              </Link>
            ))
          ) : (
            /* 검색 결과 없을 때 빈 상태 */
            <div className="emptyState">
              <p className="emptyStateIcon">🔍</p>
              <p className="emptyStateText">
                &quot;{searchQuery}&quot;에 해당하는 게시글이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;