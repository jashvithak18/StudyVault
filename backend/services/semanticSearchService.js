export const searchInNote = async (note, query) => {
  if (!query) return 'Please ask a specific question.';
  const paragraphs = [
    `This segment provides an introduction to the core academic principles outlined in ${note.title}. It explores the base parameters, history, and overall conceptual scope.`,
    `Regarding the technical components of ${note.title}, the main execution relies on data structures, continuous loops, state machine parameters, and algorithmic processing.`,
    `A crucial point to note in ${note.title} is the relationship between inputs and outputs. Adjusting input attributes yields corresponding variable swings in experimental feedback.`,
    `In summary, standard evaluations of this subject emphasize safety, efficiency, verification checking, and cooperative design principles.`
  ];
  const terms = query.toLowerCase().split(' ').filter(t => t.length > 3);
  let bestParagraph = paragraphs[0];
  let maxMatches = 0;

  paragraphs.forEach((para) => {
    let matches = 0;
    terms.forEach((term) => {
      if (para.toLowerCase().includes(term)) {
        matches++;
      }
    });
    if (matches > maxMatches) {
      maxMatches = matches;
      bestParagraph = para;
    }
  });

  return bestParagraph;
};
