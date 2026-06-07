import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./AllPosts.css"; // CSS 파일 임포트

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // 필터링 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체"); // 전체 / 모집중 / 마감

  const navigate = useNavigate();

  const handleRequireLogin = (e) => {
    e.preventDefault();
    alert("로그인이 필요한 서비스입니다.");
    navigate("/login");
  };

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
        console.error("전체 게시판 데이터 로딩 에러:", err);
      } finally {
        setLoading(false);
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
      navigate("/");
    }
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.name || user.studentId;
  };
  const filteredPosts = posts.filter((post) => {
    // 1. 검색어 필터
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      ((post.title && post.title.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.author && post.author.toLowerCase().includes(query)));

    // 2. 카테고리 필터
    const matchesCategory = selectedCategory === "전체" || post.category === selectedCategory;

    // 3. 상태 필터 (모집중 / 마감)
    let matchesStatus = true;
    if (statusFilter === "모집중") {
      matchesStatus = !post.isClosed;
    } else if (statusFilter === "마감") {
      matchesStatus = post.isClosed;
    }

    return matchesQuery && matchesCategory && matchesStatus;
  });

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
            <Link to="/all-posts" className="headerLink headerLink--active">전체 게시판</Link>
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
            <Link to="/all-posts" className="headerLink headerLink--active">전체 게시판</Link>
            <span onClick={handleRequireLogin} className="writeHeaderButton pointer-cursor">게시글 작성</span>
            <span onClick={handleRequireLogin} className="alarmBellButton pointer-cursor" title="알림">🔔</span>
            <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
            <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
          </div>
        )}
      </div>

      <div className="wideContainer">
        <h2 className="boardTitle">전체 게시판 목록</h2>
        <p className="boardDescription">등록된 모든 프로젝트 팀 매칭 게시글을 한눈에 확인할 수 있습니다.</p>

        {/* 필터 및 검색 컨트롤 */}
        <div className="filterController">
          <div className="filterSelectGroup">
            {/* 카테고리 필터 */}
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filterSelect"
            >
              <option value="전체">모든 과목</option>
              <option value="인공지능">인공지능</option>
              <option value="모바일 프로그래밍">모바일 프로그래밍</option>
              <option value="소프트웨어 공학">소프트웨어 공학</option>
              <option value="웹응용기술">웹응용기술</option>
              <option value="기타">기타</option>
            </select>

            {/* 모집 상태 필터 */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filterSelect"
            >
              <option value="전체">모든 상태</option>
              <option value="모집중">모집 중</option>
              <option value="마감">신청 마감</option>
            </select>
          </div>

          {/* 검색창 */}
          <div className="searchBarContainer">
            <div className="searchInputWrapper">
              <span className="searchIcon">🔍</span>
              <input
                type="text"
                className="searchInput"
                placeholder="제목, 내용, 작성자로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="searchClearBtn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="tableSection">
          {loading ? (
            <div className="loadingText">데이터를 로딩 중입니다...</div>
          ) : filteredPosts.length > 0 ? (
            <table className="postsTable">
              <thead>
                <tr>
                  <th className="col-no">No.</th>
                  <th className="col-category">과목</th>
                  <th>게시글 제목</th>
                  <th className="col-author">작성자</th>
                  <th className="col-people">모집인원</th>
                  <th className="col-place">장소</th>
                  <th className="col-date">등록일</th>
                  <th className="col-status">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, index) => {
                  const isClosed = post.isClosed;
                  const hasApplied = !!post.isAppliedByCurrentUser;

                  return (
                    <tr key={post.id} onClick={() => navigate(`/posts/${post.id}`)}>
                      <td className="cell-no">{filteredPosts.length - index}</td>
                      <td>
                        <span className="postCategoryBadge">
                          {post.category || "기타"}
                        </span>
                      </td>
                      <td>
                        <span className="tableTitleLink">{post.title}</span>
                      </td>
                      <td>{post.author || "익명"}</td>
                      <td>{post.people || "미정"}</td>
                      <td className="cell-place">{post.place || "미정"}</td>
                      <td className="cell-date">
                        {post.date ? post.date.split(" ")[0] : ""}
                      </td>
                      <td className="cell-status">
                        {user && post.authorId === user.studentId ? (
                          <span className="statusBadge statusMyPost">내 게시물</span>
                        ) : isClosed ? (
                          <span className="statusBadge statusClosed">신청 마감</span>
                        ) : hasApplied ? (
                          <span className="statusBadge statusApplied">신청 완료</span>
                        ) : (
                          <span className="statusBadge statusAvailable">신청 가능</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="noDataContainer">
              <p className="noDataIcon">🔍</p>
              <p className="noDataText">해당하는 게시글이 존재하지 않습니다.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllPosts;