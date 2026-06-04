export const generateSummary = async (noteTitle, description) => {
  const points = [
    `Core Topic Overview: The material focuses on the primary components of "${noteTitle}".`,
    `Technical Abstract: It introduces system dependencies, structural classifications, and standard theoretical frameworks.`,
    `Key Takeaway: A solid understanding of "${description || 'this subject'}" requires analyzing core mechanics, variables, and procedural setups.`,
    `Practical Application: Real-world problems in this area are resolved by adhering to efficiency, test validation checklists, and team collaboration.`
  ];

  return points.join('\n\n');
};
