import React from "react";
import "../assets/css/Quest.css"; // Make sure to import your CSS

const quests = [
  { id: 1, text: "Complete your profile", xp: 50, theme: "color-theme-1" },
  { id: 2, text: "Invite a friend", xp: 30, theme: "color-theme-2" },
  { id: 3, text: "Share your progress", xp: 20, theme: "color-theme-3" },
  { id: 4, text: "Complete your first task", xp: 40, theme: "color-theme-4" },
  { id: 5, text: "Reach Level 2", xp: 100, theme: "color-theme-5" },
];

function Quest() {
  return (
    <div className="background">
        <div className="Quest">
        <div className="quests-container">
            {quests.map((quest) => (
            <div key={quest.id} className={`quest-card ${quest.theme}`}>
                <span>{quest.text}</span>
                <div className="xp-badge">{quest.xp} XP</div>
            </div>
            ))}
        </div>
        </div>
    </div>
  );
}

export default Quest;
