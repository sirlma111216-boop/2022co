import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="reading py-24 text-center">
      <h1 className="text-display-md">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-4 text-body text-ink-80">주소를 다시 확인해 주세요.</p>
      <Link to="/join" className="mt-8 inline-block rounded-pill bg-action px-6 py-3 text-body-sm text-white">
        처음으로
      </Link>
    </div>
  );
}
