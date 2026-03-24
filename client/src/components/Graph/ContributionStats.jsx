import React, { useEffect, useState } from "react";
import "./ContributionStats.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ContributionStats = ({ repoOwner, repoName }) => {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/stat/repo/${repoOwner}/${repoName}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.contributions - a.contributions);
        setContributors(sorted);
      })
      .catch(err => console.error(err));
  }, [repoOwner, repoName]);

  const max = Math.max(...contributors.map(c => c.contributions), 1);

  return (
    <div className="stats-wrapper">
      <div className="stats-header">
        <h3>Repository Contributors</h3>
      </div>

      {contributors.map((user, index) => {
        const percent = (user.contributions / max) * 100;

        return (
          <div key={index} className="contributor-row">
            <div className="rank">#{index + 1}</div>

            <img src={user.avatar} alt={user.username} />

            <div className="user-info">
              <a href={user.profileUrl} target="_blank" rel="noreferrer">
                {user.username}
              </a>
              <span>{user.contributions} commits</span>

              <div className="bar">
                <div style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContributionStats;