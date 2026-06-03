import { Link } from "react-router-dom";

function Home() {
  const posts = [
    {
      id: 1,
      title: "인공지능 팀플 팀원 모집",
      content: "함께 인공지능 팀플을 진행할 팀원을 모집합니다.",
    },
    {
      id: 2,
      title: "웹 프로젝트 팀원 모집",
      content: "React를 활용한 웹 프로젝트를 같이 할 팀원을 구합니다.",
    },
    {
      id: 3,
      title: "C언어 과제 스터디 모집",
      content: "C언어 과제를 같이 공부할 스터디원을 모집합니다.",
    },
  ];

  return (
    <div className="container">
      <div className="header">
        <h2>팀 매칭 서비스</h2>

        <Link to="/notification" className="alarmButton">
          알림
        </Link>
      </div>

      <div className="menuBox">
        <Link to="/login" className="menuButton">
          로그인
        </Link>
        <Link to="/register" className="menuButton">
          회원가입
        </Link>
        <Link to="/user-info" className="menuButton">
          정보 등록
        </Link>
        <Link to="/write" className="menuButton">
          게시글 작성
        </Link>
      </div>

      <h3>게시글 목록</h3>

      <div className="postList">
        {posts.map((post) => (
          <Link to={`/post/${post.id}`} className="postCard" key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;