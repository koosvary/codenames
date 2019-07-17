export function toggleExpansion(expansion) {
  return {
    type: "TOGGLE_EXPANSION",
    expansion,
  }
}

export function changeRole(role) {
  return {
    type: "CHANGE_ROLE",
    role,
  }
}

export function toggleColourblind() {
  return {
    type: "TOGGLE_COLOURBLIND",
  }
}

export function toggleNightMode() {
  return {
    type: "TOGGLE_NIGHT_MODE",
  }
}

export function toggleDuetTeam() {
  return {
    type: "TOGGLE_DUET_TEAM",
  }
}

export function changeDuetTurns(turns) {
  return {
    type: "CHANGE_DUET_TURNS",
    turns,
  }
}

export function changeDuetMistakes(mistakes) {
  return {
    type: "CHANGE_DUET_MISTAKES",
    mistakes,
  }
}