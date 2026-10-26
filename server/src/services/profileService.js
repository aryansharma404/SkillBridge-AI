export function computeProfileCompletion(user, profile, skills = []) {
  const fields = [
    { key: 'name', label: 'Full Name', done: Boolean(user?.name?.trim()) },
    { key: 'college', label: 'College / University', done: Boolean(profile?.college?.trim()) },
    { key: 'course', label: 'Course / Degree', done: Boolean(profile?.course?.trim()) },
    { key: 'studyYear', label: 'Current Study Year', done: Boolean(profile?.studyYear?.trim()) },
    { key: 'targetRole', label: 'Target Career Role', done: Boolean(profile?.targetRole?.trim()) },
    { key: 'workMode', label: 'Preferred Work Mode', done: Boolean(profile?.workMode?.trim()) },
    { key: 'skills', label: 'At least 1 Skill Added', done: Array.isArray(skills) && skills.length > 0 }
  ];

  const completedCount = fields.filter((f) => f.done).length;
  const percentage = Math.round((completedCount / fields.length) * 100);
  const missingHints = fields.filter((f) => !f.done).map((f) => f.label);

  return {
    percentage,
    completedCount,
    totalCount: fields.length,
    missingHints,
    isComplete: missingHints.length === 0
  };
}
