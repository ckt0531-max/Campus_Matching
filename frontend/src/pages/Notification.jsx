import { Link } from "react-router-dom";

function Notification() {
  return (
    <div className="container">
      <h2>알림창</h2>

      <div className="noticeBox">
        <h3>팀 매칭 성공 알림</h3>
        <p>축하합니다. 팀 매칭에 성공했습니다.</p>
        <p>팀원들과 일정을 확인해 주세요.</p>
      </div>

      <div className="noticeBox">
        <h3>신청 완료 알림</h3>
        <p>게시글 신청이 정상적으로 완료되었습니다.</p>
      </div>

      <Link to="/" className="backButton">홈으로</Link>
    </div>
  );
}

export default Notification;