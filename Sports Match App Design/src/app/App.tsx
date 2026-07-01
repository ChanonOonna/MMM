import { useState } from "react";
import { MATCHES } from "./data";
import type { View, MainTab } from "./types";
import { Sidebar, BottomNav } from "./components/shared";
import { AuthPage } from "./pages/AuthPage";
import { OnboardPage } from "./pages/OnboardPage";
import { SwipePage } from "./pages/SwipePage";
import { ChatPage } from "./pages/ChatPage";
import { SessionsPage } from "./pages/SessionsPage";
import { SessionCreatePage } from "./pages/SessionCreatePage";
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

export default function App() {
  const [view, setView] = useState<View>("auth");
  const [mainTab, setMainTab] = useState<MainTab>("swipe");
  const [selEvent, setSelEvent] = useState("");
  const nav = (v: View) => setView(v);
  const goApp = () => setView("app");
  const setTab = (t: MainTab) => { setMainTab(t); setView("app"); };
  const unread = MATCHES.reduce((s, m) => s + m.unread, 0);

  if (view === "auth") return <AuthPage onDone={() => setView("onboarding")} />;
  if (view === "onboarding") return <OnboardPage onDone={goApp} />;
  if (view === "qr") return <QRPage onBack={goApp} />;
  if (view === "admin") return <div className="h-screen flex overflow-hidden"><AdminPage onBack={goApp} onOrganize={() => nav("organizer")} /></div>;
  if (view === "organizer") return <div className="h-screen flex flex-col overflow-hidden"><OrganizerPage onBack={goApp} /></div>;

  const renderMain = () => {
    if (view === "report") return <ReportPage onBack={goApp} />;
    if (view === "profile-other") return <ProfileOtherPage onBack={goApp} onNav={nav} onChat={() => setTab("chat")} />;
    if (view === "edit-profile") return <EditProfilePage onBack={goApp} />;
    if (view === "notifications") return <NotifsPage onBack={goApp} onNav={(v) => { setTab(v as MainTab); }} />;
    if (view === "search") return <SearchPage onBack={goApp} onProfile={() => nav("profile-other")} />;
    if (view === "settings") return <SettingsPage onBack={goApp} />;
    if (view === "session-create") return <SessionCreatePage onBack={goApp} />;
    if (view === "event-detail-full") return <EventDetailPage eventId={selEvent} onBack={goApp} onQR={() => nav("qr")} />;
    if (mainTab === "swipe") return <SwipePage onNav={nav} onChatOpen={() => setTab("chat")} />;
    if (mainTab === "sessions") return <SessionsPage onNav={nav} />;
    if (mainTab === "chat") return <ChatPage onNav={nav} />;
    if (mainTab === "events") return <EventsPage onDetail={id => { setSelEvent(id); nav("event-detail-full"); }} />;
    if (mainTab === "profile") return <ProfilePage onNav={nav} />;
  };

  const isFullApp = view === "app" || ["report","profile-other","edit-profile","notifications","search","settings","session-create","event-detail-full"].includes(view);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {isFullApp && <Sidebar tab={mainTab} setTab={setTab} onNav={nav} unread={unread} />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">{renderMain()}</div>
        {isFullApp && <BottomNav tab={mainTab} setTab={setTab} />}
        {isFullApp && <div className="h-16 lg:hidden shrink-0" />}
      </main>
    </div>
  );
}
