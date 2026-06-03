import { Link } from "react-router-dom";

function WritePost() {
  return (
    <div className="container">
      <h2>게시글 작성</h2>

      <div className="formBox">
        <input type="text" placeholder="게시글 제목" />

        <select>
          <option>과목 선택</option>
          <option>인공지능</option>
          <option>모바일 프로그래밍</option>
          <option>소프트웨어 공학</option>
          <option>웹응용기술</option>
        </select>

        <input type="text" placeholder="모집 인원" />
        <input type="text" placeholder="장소" />

        <textarea placeholder="게시글 내용을 입력하세요"></textarea>

        <button>작성 완료</button>
      </div>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default WritePost;