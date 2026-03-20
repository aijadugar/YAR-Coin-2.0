import React, { useEffect, useState } from "react";
import "./ContributionStats.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ContributionStats = () => {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    fetch(BASE_URL)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.contributions - a.contributions);
        setContributors(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  const maxContributions = Math.max(...contributors.map(c => c.contributions), 1);

  return (
    <div className="stats-container">
      <h3 className="stats-title">Contributors</h3>

      {contributors.map((user, index) => {
        const percentage = (user.contributions / maxContributions) * 100;

        return (
          <div key={index} className="contributor-card">
            <img src={user.avatar} alt={user.username} className="avatar" />

            <div className="info">
              <a href={user.profileUrl} target="_blank" rel="noreferrer">
                {user.username}
              </a>

              <span className="count">{user.contributions} commits</span>

              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionStats;