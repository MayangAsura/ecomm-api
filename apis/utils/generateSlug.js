export const idString = (_statement) => {
    return String(_statement).toLowerCase().split(" ").join("");
  };