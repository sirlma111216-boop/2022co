import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useSession } from "@/lib/session-context";
import Join from "@/pages/Join";
import Start from "@/pages/Start";
import Session1 from "@/pages/Session1";
import Session2 from "@/pages/Session2";
import Session3 from "@/pages/Session3";
import Final from "@/pages/Final";
import Reflect from "@/pages/Reflect";
import Presenter from "@/pages/Presenter";
import NotFound from "@/pages/NotFound";

/** 해시가 붙은 링크로 들어와도 해당 섹션까지 스크롤되도록 */
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(t);
  }, [hash, pathname]);
  return null;
}

/** 아직 입장하지 않았으면 /join으로 보낸다 (강사 화면은 예외) */
function RequireJoin({ children }: { children: ReactNode }) {
  const { ready, joined } = useSession();
  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-caption text-ink-48">
        불러오는 중…
      </div>
    );
  }
  return joined ? <>{children}</> : <Navigate to="/join" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/join" replace />} />
          <Route path="/join" element={<Join />} />
          <Route path="/start" element={<RequireJoin><Start /></RequireJoin>} />
          <Route path="/s1" element={<RequireJoin><Session1 /></RequireJoin>} />
          <Route path="/s2" element={<RequireJoin><Session2 /></RequireJoin>} />
          <Route path="/s3" element={<RequireJoin><Session3 /></RequireJoin>} />
          <Route path="/final" element={<RequireJoin><Final /></RequireJoin>} />
          <Route path="/reflect" element={<RequireJoin><Reflect /></RequireJoin>} />
          <Route path="/presenter" element={<Presenter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </>
  );
}
