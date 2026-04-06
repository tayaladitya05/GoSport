/**
 * Heuristic "AI" squad scoring from past match stats (CricketStat / FootballStat).
 * Not machine learning — transparent rules so you can tune weights later.
 */

const DEFAULT_SQUAD_SIZE = 11;

function aggregateCricket(stats) {
  if (!stats || stats.length === 0) {
    return {
      matches: 0,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wickets: 0,
      overs: 0,
    };
  }
  return {
    matches: stats.length,
    runs: stats.reduce((s, x) => s + (x.runs || 0), 0),
    ballsFaced: stats.reduce((s, x) => s + (x.ballsFaced || 0), 0),
    fours: stats.reduce((s, x) => s + (x.fours || 0), 0),
    sixes: stats.reduce((s, x) => s + (x.sixes || 0), 0),
    wickets: stats.reduce((s, x) => s + (x.wickets || 0), 0),
    overs: stats.reduce((s, x) => s + (x.overs || 0), 0),
  };
}

function aggregateFootball(stats) {
  if (!stats || stats.length === 0) {
    return {
      matches: 0,
      goals: 0,
      assists: 0,
      minutesPlayed: 0,
      yellowCards: 0,
      redCards: 0,
    };
  }
  return {
    matches: stats.length,
    goals: stats.reduce((s, x) => s + (x.goals || 0), 0),
    assists: stats.reduce((s, x) => s + (x.assists || 0), 0),
    minutesPlayed: stats.reduce((s, x) => s + (x.minutesPlayed || 0), 0),
    yellowCards: stats.reduce((s, x) => s + (x.yellowCards || 0), 0),
    redCards: stats.reduce((s, x) => s + (x.redCards || 0), 0),
  };
}

/**
 * @param {string} role - from Player.role (e.g. batsman, bowler)
 * @param {object[]} cricketStats - all CricketStat docs for this player (career)
 */
function scoreCricketPlayer(role, cricketStats) {
  const c = aggregateCricket(cricketStats);
  const r = (role || "").toLowerCase();
  const m = c.matches;
  const rpg = m > 0 ? c.runs / m : 0;
  const balls = c.ballsFaced;
  const sr = balls > 0 ? (c.runs / balls) * 100 : 0;
  const wpg = m > 0 ? c.wickets / m : 0;

  let score = 0;
  let reason = "";

  if (m === 0) {
    score = 1;
    reason = "No career innings yet — neutral baseline so they can still be ranked.";
    return { score, reason, career: c };
  }

  if (r.includes("bat")) {
    score = rpg * 4 + sr * 0.12 + c.fours * 0.35 + c.sixes * 0.7;
    reason = `Batting lean: ~${rpg.toFixed(1)} runs/match, SR ${sr.toFixed(1)}`;
  } else if (r.includes("bowl")) {
    score = wpg * 12 + c.wickets * 0.35 + c.overs * 0.12;
    reason = `Bowling lean: ~${wpg.toFixed(2)} wkts/match, ${c.wickets} career wkts`;
  } else {
    score = rpg * 2.5 + sr * 0.08 + wpg * 8 + c.wickets * 0.25;
    reason = `All-round: ~${rpg.toFixed(1)} r/m, ~${wpg.toFixed(2)} w/m`;
  }

  return { score, reason, career: c };
}

/**
 * @param {string} role
 * @param {object[]} footballStats - all FootballStat docs for this player (career)
 */
function scoreFootballPlayer(role, footballStats) {
  const f = aggregateFootball(footballStats);
  const m = f.matches;
  const gpg = m > 0 ? f.goals / m : 0;
  const apg = m > 0 ? f.assists / m : 0;
  const minsPerMatch = m > 0 ? f.minutesPlayed / m : 0;
  const cardPenalty = f.yellowCards * 0.25 + f.redCards * 2;

  let score = 0;
  let reason = "";

  if (m === 0) {
    score = 1;
    reason = "No career matches yet — neutral baseline.";
    return { score, reason, career: f };
  }

  const r = (role || "").toLowerCase();
  score = gpg * 18 + apg * 12 + minsPerMatch * 0.015 - cardPenalty;

  if (r.includes("strik") || r.includes("forward") || r.includes("attack")) {
    score += gpg * 3;
  } else if (r.includes("defend") || r.includes("back")) {
    score += apg * 2;
  }

  reason = `~${gpg.toFixed(2)} goals/match, ~${apg.toFixed(2)} assists/match; cards penalty applied`;

  return { score, reason, career: f };
}

module.exports = {
  DEFAULT_SQUAD_SIZE,
  scoreCricketPlayer,
  scoreFootballPlayer,
};
