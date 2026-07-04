import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router";
import type { View, MainTab } from "./types";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";
import { Sidebar, BottomNav } from "./components/shared";
import { AuthPage } from "./pages/AuthPage";
import { OnboardPage } from "./pages/OnboardPage";
import { SwipePage } from "./pages/SwipePage";
import { ChatPage } from "./pages/ChatPage";
import { SessionsPage } from "./pages/SessionsPage";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { QRPage } from "./pages/QRPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileOtherPage } from "./pages/ProfileOtherPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { NotifsPage } from "./pages/NotifsPage";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReportPage } from "./pages/ReportPage";
import { OrganizerPage } from "./pages/OrganizerPage";
import { AdminPage } from "./pages/AdminPage";

// Everything that isn't its own top-level route yet (report, profile-other, ...)
// is still switched locally via `view`/`mainTab` state, same as before routing was introduced.
function MainAppShell() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("app");
  const [mainTab, setMainTab] = useState<MainTab>("swipe");
  const [selEvent, setSelEvent] = useState("");
  const [selSession, setSelSession] = useState("");
  const goApp = () => setView("app");
  const setTab = (t: MainTab) => { setMainTab(t); setView("app"); };
  const unread = 0;

  // "admin" / "organizer" / "qr" now live at their own top-level routes.
  const nav = (v: View) => {
    if (v === "admin" || v === "organizer" || v === "qr") { navigate(`/${v}`); return; }
    if (v === "auth") { navigate("/auth"); return; }
    setView(v);
  };

  const renderMain = () => {
    if (view === "report") return <ReportPage onBack={goApp} />;
    if (view === "profile-other") return <ProfileOtherPage onBack={goApp} onNav={nav} onChat={() => setTab("chat")} />;
    if (view === "edit-profile") return <EditProfilePage onBack={goApp} />;
    if (view === "notifications") return <NotifsPage onBack={goApp} onNav={(v) => { setTab(v as MainTab); }} />;
    if (view === "search") return <SearchPage onBack={goApp} onProfile={() => nav("profile-other")} />;
    if (view === "settings") return <SettingsPage onBack={goApp} />;
    if (view === "event-detail-full") return <EventDetailPage eventId={selEvent} onBack={goApp} onQR={() => nav("qr")} />;
    if (view === "session-detail-full") return <SessionDetailPage sessionId={selSession} onBack={goApp} onReport={() => nav("report")} />;
    if (mainTab === "swipe") return <SwipePage onNav={nav} onChatOpen={() => setTab("chat")} />;
    if (mainTab === "sessions") return <SessionsPage onDetail={id => { setSelSession(id); nav("session-detail-full"); }} onNav={nav} />;
    if (mainTab === "chat") return <ChatPage onNav={nav} />;
    if (mainTab === "events") return <EventsPage onDetail={id => { setSelEvent(id); nav("event-detail-full"); }} onNav={nav} />;
    if (mainTab === "profile") return <ProfilePage onNav={nav} />;
  };

  const isFullApp = view === "app" || ["report","profile-other","edit-profile","notifications","search","settings","event-detail-full","session-detail-full"].includes(view);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {isFullApp && <Sidebar tab={mainTab} setTab={setTab} onNav={nav} unread={unread} view={view} />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">{renderMain()}</div>
        {isFullApp && <BottomNav tab={mainTab} setTab={setTab} />}
        {isFullApp && <div className="h-16 lg:hidden shrink-0" />}
      </main>
    </div>
  );
}

function AuthRoute() {
  // No imperative navigation here — PublicOnlyRoute reacts to the auth status change
  // and redirects on its own once login()/register() resolves, so there's nothing to race.
  return <AuthPage onDone={() => {}} />;
}

function OnboardRoute() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  return (
    <OnboardPage
      onDone={() => {
        completeOnboarding();
        navigate("/app");
      }}
    />
  );
}

function QRRoute() {
  const navigate = useNavigate();
  return <QRPage onBack={() => navigate("/app")} />;
}

function AdminRoute() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex overflow-hidden">
      <AdminPage onBack={() => navigate("/app")} onOrganize={(eventId) => navigate("/organizer", { state: { eventId } })} />
    </div>
  );
}

function OrganizerRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = (location.state as { eventId?: string } | null)?.eventId;
  return (
    <div className="h-screen flex overflow-hidden">
      <OrganizerPage onBack={() => navigate("/app")} initialEventId={eventId} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<PublicOnlyRoute><AuthRoute /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardRoute /></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute><QRRoute /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminRoute /></ProtectedRoute>} />
        <Route path="/organizer" element={<ProtectedRoute roles={["admin", "event_organizer"]}><OrganizerRoute /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><MainAppShell /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AuthProvider>
  );
}
