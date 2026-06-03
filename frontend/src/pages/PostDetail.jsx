import { Link, useParams } from "react-router-dom";

function PostDetail() {
  const { id } = useParams();

  const posts = [
    {
      id: 1,
      title: "인공지능 팀플 팀원 모집",
      category: "인공지능",
      people: "4명",
      place: "성결관 401호",
      content: "함께 인공지능 팀플을 진행할 팀원을 모집합니다.",
    },
    {
      id: 2,
      title: "웹 프로젝트 팀원 모집",
      category: "웹 개발",
      people: "3명",
      place: "학술정보관",
      content: "React를 활용한 웹 프로젝트를 같이 할 팀원을 구합니다.",
    },
    {
      id: 3,
      title: "C언어 과제 스터디 모집",
      category: "C프로그래밍",
      people: "5명",
      place: "온라인",
      content: "C언어 과제를 같이 공부할 스터디원을 모집합니다.",
    },
  ];

  const post = posts.find((item) => item.id === Number(id));

  const onClickApply = () => {
    alert("신청 완료");
  };

  if (!post) {
    return (
      <div className="container">
        <h2>게시글을 찾을 수 없습니다.</h2>
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
        <h3>{post.title}</h3>

        <p>모집 분야: {post.category}</p>
        <p>모집 인원: {post.people}</p>
        <p>장소: {post.place}</p>
        <p>내용: {post.content}</p>

        <button onClick={onClickApply}>클릭하기</button>
      </div>

      <Link to="/" className="backButton">
        홈으로
      </Link>
    </div>
  );
}

export default PostDetail;