import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [posts] = useState(() => {
    const storedPosts = localStorage.getItem("posts");
    if (storedPosts) {
      return JSON.parse(storedPosts);
    }
    // App.jsx에서 대개 설정하지만, 혹시 없을 경우의 초기값
    const defaultPosts = [
      {
        id: 1,
        title: "인공지능 팀플 팀원 모집",
        category: "인공지능",
        people: "4명",
        place: "성결관 401호",
        content: "함께 인공지능 팀플을 진행할 팀원을 모집합니다. AI 기초 지식이 있는 분 대환영합니다!",
        author: "김철수",
        date: "2026-06-05",
      },
      {
        id: 2,
        title: "웹 프로젝트 팀원 모집",
        category: "웹응용기술",
        people: "3명",
        place: "학술정보관",
        content: "React를 활용한 웹 프로젝트를 같이 할 팀원을 구합니다. 프론트/백엔드 가리지 않고 환영합니다.",
        author: "이영희",
        date: "2026-06-04",
      },
      {
        id: 3,
        title: "C언어 과제 스터디 모집",
        category: "모바일 프로그래밍",
        people: "5명",
        place: "온라인",
        content: "C언어 과제를 같이 공부할 스터디원을 모집합니다. 매주 스터디 진행합니다.",
        author: "박민수",
        date: "2026-06-03",
      },
    ];
    localStorage.setItem("posts", JSON.stringify(defaultPosts));
    return defaultPosts;
  });

  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  // 실시간 검색 필터링용 상태
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    // 임시 로그아웃 처리
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
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
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const matched = mockUsers.find((u) => u.username === user.username);
    return matched ? matched.name || user.username : user.username;
  };

  // 신청한 게시글 ID 목록 로드
  const appliedPostIds = (() => {
    const applied = localStorage.getItem("appliedPosts");
    return applied ? JSON.parse(applied) : [];
  })();

  // 읽지 않은 알림 개수 계산
  const unreadCount = (() => {
    if (!user) return 0;
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    return allNotifications.filter(n => n.username === user.username && !n.isRead).length;
  })();

  return (
    <>
      <div className="globalHeaderLinks">
        {user ? (
          <div className="userNav">
            <span className="userGreeting">
              <strong>{getDisplayName()}</strong>님
            </span>
            <Link to="/user-info" className="headerLink">회원 정보</Link>
            <button onClick={handleLogout} className="logoutBtn">로그아웃</button>
          </div>
        ) : (
          <div className="userNav">
            <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
            <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
          </div>
        )}
        {/* 알림 종 아이콘: 로그인 상태일 때만 표시 */}
        {user && (
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
        )}
      </div>

      <div className="container">
        {/* 헤더: 로고 좌측, 메뉴 우측 */}
        <div className="header">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>
              <span className="logoEmoji">🤝</span>
              <span className="logoTitle">팀 매칭 서비스</span>
            </h2>
          </Link>
        </div>

        {/* 게시글 작성 버튼 (항상 표시) */}
      <div className="actionBar">
        <Link to="/write" className="writeButton">
          게시글 작성
        </Link>
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
            // /posts/:id 형태의 경로로 연결
            <Link to={`/posts/${post.id}`} className="postCard" key={post.id}>
              <div className="postCardTop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {post.category && (
                  <span className="postCategoryBadge">{post.category}</span>
                )}
                {appliedPostIds.map(String).includes(post.id.toString()) ? (
                  <span className="appliedBadge" style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>신청 완료</span>
                ) : (
                  <span className="unappliedBadge" style={{
                    backgroundColor: '#e2e8f0',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>신청 가능</span>
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