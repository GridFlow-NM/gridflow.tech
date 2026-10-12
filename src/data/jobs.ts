// Open roles shown on /careers/. Add an entry to post a job; delete it when filled.
// Applications go to the email address below with the job title in the subject line.
//
// Example:
// {
//   title: "Senior Electrical / Power Engineer",
//   type: "Full-time",
//   location: "Albuquerque, NM (on-site)",
//   summary: "Design and commission vanadium flow battery systems for utility and commercial customers.",
// },

export const applyEmail = "info@gridflow.tech";

export type Job = {
  title: string;
  type: string;
  location: string;
  summary: string;
};

export const jobs: Job[] = [];
