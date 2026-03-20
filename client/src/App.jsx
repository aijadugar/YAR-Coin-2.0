import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Authentication/Auth";
import TeacherHome from "./components/Teacher-Dashboard/TeacherHome";
import HomePage from "./components/Home-Page/HomePage";
import Playground from "./components/Student-Dashboard/Playground";
import StudentChatInterface from "./components/Chat-Interface/StudentChatInterface";
import TeacherChatInterface from "./components/Chat-Interface/TeacherChatInterface";
import Dex from "./components/DEX/Dex";
import Penalty from "./components/Penalty/PenaltyPage";
import PenaltyHistory from "./components/Penalty/PenaltyHistory";
import NFT from "./components/NFT/NFT";
import NFTHistory from "./components/NFT/NFTHistory";
// import Graph from "./components/Graph/Graph";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth/>} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/teacher-home" element={<TeacherHome />} />
        <Route path="/student/playground" element={<Playground/>} />
        <Route path="/student-workspace" element={<StudentChatInterface />} />
        <Route path="/teacher-workspace" element={<TeacherChatInterface />} />
        <Route path="/dexes" element={<Dex />} />
        <Route path="/penalty" element={<Penalty/>}/>
        <Route path="/penaltyhistory" element={<PenaltyHistory/>}/>
        <Route path="/nft" element={<NFT/>}/>
        <Route path="/nfthistory" element={<NFTHistory/>}/>
      </Routes>
    </Router>
  );
}

export default App;
