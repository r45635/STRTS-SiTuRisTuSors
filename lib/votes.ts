const VOTES_KEY = "strts_votes";

export interface VoteBlague {
  up: number;
  down: number;
  monVote?: "up" | "down";
}

type VotesStore = Record<string, Omit<VoteBlague, "monVote"> & { monVote?: "up" | "down" }>;

function chargerVotes(): VotesStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function sauvegarderVotes(votes: VotesStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function obtenirVotes(blagueId: string): VoteBlague {
  const votes = chargerVotes();
  return votes[blagueId] ?? { up: 0, down: 0 };
}

export function voterPourBlague(blagueId: string, vote: "up" | "down"): VoteBlague {
  const votes = chargerVotes();
  const actuel = votes[blagueId] ?? { up: 0, down: 0 };

  if (actuel.monVote === vote) {
    // Annuler le vote
    const nouveau = { ...actuel, [vote]: Math.max(0, actuel[vote] - 1), monVote: undefined };
    votes[blagueId] = nouveau;
    sauvegarderVotes(votes);
    return nouveau;
  }

  // Retirer l'ancien vote si existant
  const nouveau: VoteBlague = { ...actuel };
  if (actuel.monVote) {
    nouveau[actuel.monVote] = Math.max(0, actuel[actuel.monVote] - 1);
  }
  nouveau[vote] = (actuel[vote] ?? 0) + 1;
  nouveau.monVote = vote;

  votes[blagueId] = nouveau;
  sauvegarderVotes(votes);
  return nouveau;
}
