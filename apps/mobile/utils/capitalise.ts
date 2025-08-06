function capitaliseFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function capitaliseSentence(val: string) {
  return String(val)
    .split(' ')
    .map((word) => capitaliseFirstLetter(word))
    .join(' ');
}

export { capitaliseFirstLetter, capitaliseSentence };
