import { Link } from "react-router-dom";

function UserInfo() {
  return (
    <div className="container">
      <h2>사용자 정보 등록</h2>

      <div className="formBox">
        <input type="text" placeholder="이름" />
        <input type="text" inputmode="numeric" pattern="[0-8]*" placeholder="학번" />
        <input type="text" placeholder="학과" />

        <select>
          <option>역할 선택</option>
          <option>보고서 및 PPT</option>
          <option>발표</option>
          <option>코딩</option>
          <option>팀장</option>
        </select>

        <textarea placeholder="자기소개를 입력하세요"></textarea>

        <button>정보 등록</button>
      </div>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default UserInfo;