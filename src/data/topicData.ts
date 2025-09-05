// Predefined topics organized by subject for searchable dropdown
export const topicsBySubject: Record<string, string[]> = {
  'Mathematics': [
    'Calculus - Limits and Continuity',
    'Calculus - Differentiation',
    'Calculus - Integration',
    'Linear Algebra - Matrices',
    'Linear Algebra - Vectors',
    'Statistics - Probability',
    'Statistics - Distributions',
    'Trigonometry - Identities',
    'Trigonometry - Equations',
    'Geometry - Coordinate Geometry',
    'Algebra - Quadratic Equations',
    'Algebra - Polynomials'
  ],
  'Physics': [
    'Mechanics - Newton\'s Laws',
    'Mechanics - Energy and Momentum',
    'Thermodynamics - Heat Transfer',
    'Thermodynamics - Laws of Thermodynamics',
    'Electromagnetism - Electric Fields',
    'Electromagnetism - Magnetic Fields',
    'Optics - Ray Optics',
    'Optics - Wave Optics',
    'Modern Physics - Quantum Mechanics',
    'Modern Physics - Relativity',
    'Waves - Sound Waves',
    'Waves - Electromagnetic Waves'
  ],
  'Chemistry': [
    'Organic Chemistry - Hydrocarbons',
    'Organic Chemistry - Functional Groups',
    'Inorganic Chemistry - Periodic Table',
    'Inorganic Chemistry - Chemical Bonding',
    'Physical Chemistry - Thermodynamics',
    'Physical Chemistry - Kinetics',
    'Physical Chemistry - Electrochemistry',
    'Analytical Chemistry - Qualitative Analysis',
    'Analytical Chemistry - Quantitative Analysis',
    'Environmental Chemistry - Pollution',
    'Biochemistry - Enzymes',
    'Biochemistry - Metabolism'
  ],
  'Biology': [
    'Cell Biology - Cell Structure',
    'Cell Biology - Cell Division',
    'Genetics - Inheritance',
    'Genetics - DNA and RNA',
    'Evolution - Natural Selection',
    'Evolution - Speciation',
    'Ecology - Ecosystems',
    'Ecology - Food Chains',
    'Human Anatomy - Respiratory System',
    'Human Anatomy - Circulatory System',
    'Plant Biology - Photosynthesis',
    'Plant Biology - Plant Reproduction'
  ],
  'English': [
    'Literature - Poetry Analysis',
    'Literature - Novel Studies',
    'Grammar - Parts of Speech',
    'Grammar - Sentence Structure',
    'Writing - Essay Composition',
    'Writing - Creative Writing',
    'Reading Comprehension - Fiction',
    'Reading Comprehension - Non-fiction',
    'Vocabulary - Etymology',
    'Vocabulary - Context Clues',
    'Public Speaking - Presentation Skills',
    'Public Speaking - Debate Techniques'
  ],
  'History': [
    'Ancient History - Civilizations',
    'Ancient History - Classical Period',
    'Medieval History - Feudalism',
    'Medieval History - Crusades',
    'Modern History - Industrial Revolution',
    'Modern History - World Wars',
    'Contemporary History - Cold War',
    'Contemporary History - Globalization',
    'Social History - Cultural Movements',
    'Social History - Revolutionary Changes',
    'Political History - Government Systems',
    'Political History - Democracy'
  ],
  'Geography': [
    'Physical Geography - Climate',
    'Physical Geography - Landforms',
    'Human Geography - Population',
    'Human Geography - Migration',
    'Economic Geography - Trade',
    'Economic Geography - Resources',
    'Environmental Geography - Conservation',
    'Environmental Geography - Sustainability',
    'Regional Geography - Continents',
    'Regional Geography - Countries',
    'Cartography - Map Reading',
    'Cartography - GIS Systems'
  ],
  'Computer Science': [
    'Programming - Data Structures',
    'Programming - Algorithms',
    'Programming - Object-Oriented Programming',
    'Database - SQL Queries',
    'Database - Database Design',
    'Networks - TCP/IP Protocol',
    'Networks - Network Security',
    'Web Development - HTML/CSS',
    'Web Development - JavaScript',
    'Software Engineering - Design Patterns',
    'Software Engineering - Testing',
    'Artificial Intelligence - Machine Learning'
  ],
  'Economics': [
    'Microeconomics - Supply and Demand',
    'Microeconomics - Market Structures',
    'Macroeconomics - GDP and Growth',
    'Macroeconomics - Inflation',
    'International Economics - Trade',
    'International Economics - Exchange Rates',
    'Development Economics - Poverty',
    'Development Economics - Economic Growth',
    'Financial Economics - Banking',
    'Financial Economics - Investment',
    'Behavioral Economics - Decision Making',
    'Behavioral Economics - Market Psychology'
  ],
  'Psychology': [
    'Cognitive Psychology - Memory',
    'Cognitive Psychology - Learning',
    'Social Psychology - Group Behavior',
    'Social Psychology - Social Influence',
    'Developmental Psychology - Child Development',
    'Developmental Psychology - Adolescence',
    'Abnormal Psychology - Mental Disorders',
    'Abnormal Psychology - Therapy',
    'Biological Psychology - Brain Function',
    'Biological Psychology - Neurotransmitters',
    'Research Methods - Statistics',
    'Research Methods - Experimental Design'
  ]
};

export const getAllTopics = (): string[] => {
  return Object.values(topicsBySubject).flat();
};

export const getTopicsBySubject = (subject: string): string[] => {
  return topicsBySubject[subject] || [];
};