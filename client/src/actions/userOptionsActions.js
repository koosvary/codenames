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