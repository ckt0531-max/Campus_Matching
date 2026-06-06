import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

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
        const postsList = await api.get("/posts");
        setPosts(postsList);

        if (user && user.studentId) {
          const notiRes = await api.get(`/notifications/${user.studentId}`);
          if (notiRes && notiRes.success && Array.isArray(notiRes.data)) {
            const count = notiRes.data.filter((n) => !n.isRead).length;
            setUnreadCount(count);
          }
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

  const appliedPostIds = (() => {
    const applied = localStorage.getItem("appliedPosts");
    return applied ? JSON.parse(applied) : [];
  })();

  // 필터 적용
  const filteredPosts = posts.filter((post) => {
    // 1. 검색어 필터
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || (
      (post.title && post.title.toLowerCase().includes(query)) ||
      (post.content && post.content.toLowerCase().includes(query)) ||
      (post.author && post.author.toLowerCase().includes(query))
    );

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
          <span className="logoEmoji" style={{ fontSize: '24px', margin: 0 }}>🤝</span>
          <span className="logoTitle" style={{ fontWeight: 800, fontSize: '18px' }}>팀 매칭 서비스</span>
        </Link>

        {user ? (
          <>
            <Link to="/all-posts" className="headerLink" style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>전체 게시판</Link>
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
            <Link to="/user-info" className="userInfoBtn">{getDisplayName()}님</Link>
            <button onClick={handleLogout} className="logoutBtn">로그아웃</button>
          </>
        ) : (
          <div className="userNav">
            <Link to="/all-posts" className="headerLink" style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>전체 게시판</Link>
            <span onClick={handleRequireLogin} className="writeHeaderButton" style={{ cursor: "pointer" }}>게시글 작성</span>
            <span onClick={handleRequireLogin} className="alarmBellButton" style={{ cursor: "pointer" }} title="알림">🔔</span>
            <Link to="/register" className="headerLink headerLinkOutline">회원가입</Link>
            <Link to="/login" className="headerLink headerLinkFilled">로그인</Link>
          </div>
        )}
      </div>

      <div className="wideContainer">
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "10px" }}>전체 게시판 목록</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "15px" }}>등록된 모든 프로젝트 팀 매칭 게시글을 한눈에 확인할 수 있습니다.</p>

        {/* 필터 및 검색 컨트롤 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
          <div style={{ flex: 1, maxWidth: "400px", minWidth: "260px" }}>
            <div className="searchInputWrapper" style={{ padding: "2px 8px" }}>
              <span className="searchIcon">🔍</span>
              <input
                type="text"
                className="searchInput"
                placeholder="제목, 내용, 작성자로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 4px" }}
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
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>데이터를 로딩 중입니다...</div>
          ) : filteredPosts.length > 0 ? (
            <table className="postsTable">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>No.</th>
                  <th style={{ width: "130px" }}>과목</th>
                  <th>게시글 제목</th>
                  <th style={{ width: "90px" }}>작성자</th>
                  <th style={{ width: "80px" }}>모집인원</th>
                  <th style={{ width: "120px" }}>장소</th>
                  <th style={{ width: "110px", textAlign: "center" }}>등록일</th>
                  <th style={{ width: "100px", textAlign: "center" }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, index) => {
                  const isClosed = post.isClosed;
                  const hasApplied = appliedPostIds.map(String).includes(post.id.toString());

                  return (
                    <tr key={post.id} onClick={() => navigate(`/posts/${post.id}`)}>
                      <td style={{ textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>{filteredPosts.length - index}</td>
                      <td>
                        <span className="postCategoryBadge" style={{ margin: 0 }}>
                          {post.category || "기타"}
                        </span>
                      </td>
                      <td>
                        <span className="tableTitleLink">{post.title}</span>
                      </td>
                      <td>{post.author || "익명"}</td>
                      <td>{post.people || "미정"}</td>
                      <td style={{ color: "#475569", fontSize: "13px" }}>{post.place || "미정"}</td>
                      <td style={{ textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                        {post.date ? post.date.split(" ")[0] : ""}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {user && post.authorId === user.studentId ? (
                          <span style={{
                            backgroundColor: '#ede9fe',
                            color: '#8b5cf6',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd6fe'
                          }}>내 게시물</span>
                        ) : isClosed ? (
                          <span style={{
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fca5a5'
                          }}>신청 마감</span>
                        ) : hasApplied ? (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1'
                          }}>신청 완료</span>
                        ) : (
                          <span style={{
                            backgroundColor: '#d1fae5',
                            color: '#10b981',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0'
                          }}>신청 가능</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "36px", margin: 0 }}>🔍</p>
              <p style={{ color: "#94a3b8", fontWeight: "500", marginTop: "10px" }}>해당하는 게시글이 존재하지 않습니다.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllPosts;
