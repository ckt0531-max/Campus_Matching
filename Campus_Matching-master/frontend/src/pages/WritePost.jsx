import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function WritePost() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("과목 선택");
  const [people, setPeople] = useState("");
  const [place, setPlace] = useState("");
  const [content, setContent] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authorName] = useState(() => {
    // 현재 로그인했거나 정보 등록한 작성자의 이름 가져오기
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsed = JSON.parse(loggedInUser);
      return parsed.username || "임시 사용자";
    }
    return "임시 사용자";
  });
  
  const navigate = useNavigate();

  const handleWritePost = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 입력값 검증
    if (!title.trim()) {
      setErrorMsg("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("내용을 입력해주세요.");
      return;
    }

    // 프론트 임시 게시글 저장, 추후 백엔드 API 연결 필요
    const storedPosts = localStorage.getItem("posts");
    const postsList = storedPosts ? JSON.parse(storedPosts) : [];

    const newPost = {
      id: Date.now(), // 고유 ID 부여
      title: title.trim(),
      category: subject !== "과목 선택" ? subject : "기타",
      people: people.trim() || "인원 미정",
      place: place.trim() || "장소 미정",
      content: content.trim(),
      author: authorName,
      date: new Date().toISOString().slice(0, 10), // 현재 날짜 (YYYY-MM-DD)
    };

    // 최신 글이 맨 위에 보이도록 앞에 추가
    postsList.unshift(newPost);
    localStorage.setItem("posts", JSON.stringify(postsList));

    setSuccessMsg("게시글 작성이 성공적으로 완료되었습니다!");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="container">
      <h2>게시글 작성</h2>

      <form onSubmit={handleWritePost} className="formBox">
        {errorMsg && <div className="errorAlert">{errorMsg}</div>}
        {successMsg && <div className="successAlert">{successMsg}</div>}

        <label className="inputLabel">게시글 제목</label>
        <input
          type="text"
          placeholder="게시글 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="inputLabel">과목 선택</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="과목 선택">과목 선택</option>
          <option value="인공지능">인공지능</option>
          <option value="모바일 프로그래밍">모바일 프로그래밍</option>
          <option value="소프트웨어 공학">소프트웨어 공학</option>
          <option value="웹응용기술">웹응용기술</option>
        </select>

        <label className="inputLabel">모집 인원</label>
        <input
          type="text"
          placeholder="모집 인원을 입력하세요 (예: 3명)"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
        />

        <label className="inputLabel">장소</label>
        <input
          type="text"
          placeholder="장소를 입력하세요 (예: 학술정보관 1층)"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />

        <label className="inputLabel">게시글 내용</label>
        <textarea
          placeholder="게시글 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <button type="submit">작성 완료</button>
      </form>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default WritePost;